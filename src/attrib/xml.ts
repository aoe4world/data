import path from "path";
import fs from "fs/promises";
import xml2js from "xml2js";
import { parseBooleans, parseNumbers } from "xml2js/lib/processors";
import { writeJson } from "../lib/files/writeData";
import { writeFile } from "fs";
import { ATTRIB_FOLDER, SOURCE_FOLDER } from "./config";
import { NormalizedAttrib } from "./essence";
import { RunContext } from "./run";

/* This scripts is used to parse Relic Attrib XML files into easier to use JS objects (in memory).
Taking into account references and inheritance to other XML files.

Example:
```xml
<instance version="4" description="Chinese Feudal Age Archer" template="sbps">
	<list name="extensions">
		<template_reference name="squadexts" value="sbpextensions\squad_loadout_ext" overrideParent="True" List.ItemID="-1479400647" List.ParentItemID="-1479400647">
			<list name="unit_list">
				<group name="loadout_data" List.ItemID="-1011304488">
					<float name="num" value="1" />
					<instance_reference name="type" value="ebps\races\chinese\units\unit_archer_2_chi" />
					<list name="unit_attachments">
					</list>
					<bool name="is_default_unit" value="True" />
				</group>
			</list>
			<float name="squad_female_chance" value="0" />
      ....
```

becomes
```json
{
  "version": 4,
  "description": "Chinese Feudal Age Archer",
  "template": "sbps",
  "extensions": [
    {
      "squadexts": "sbpextensions/squad_loadout_ext",
      "unit_list": [
        {
          "loadout_data": {
            "num": 1,
            "type": "ebps/races/chinese/units/unit_archer_2_chi",
            "unit_attachments": [],
            "is_default_unit": true
          }
        }
      ]
      "squad_female_chance": 0
    }
  ]
}
```
    */
const cache = new Map<string, any>();
export async function getXmlData<T = NormalizedAttrib>(file: string, base: string = path.join(ATTRIB_FOLDER, "instances"), context: RunContext): Promise<T | undefined> {
  if (!file.endsWith(".xml")) file += ".xml";
  let filePath = path.join(base, file);
  if (cache.has(filePath)) return cache.get(filePath) as T;
  try {
    const fileData = fs.readFile(filePath, "utf-8");
    // Step 1: Parse the XML file into a JS object, ff the file has a parent, also fully fetch it recursively
    const raw = await parser.parseStringPromise(await fileData);
    let parent;
    const parentPath = raw.instance_reference?.find((r: any) => r.$attr.name === "parent_pbg")?.$attr.value;
    if (parentPath) parent = await getXmlData(formatValue(parentPath), base, context);

    // Step 2: Parse the object into our own normalized format
    const parsed = parseAttribObject(raw) as T;

    // Step 3: Merge the parent into the child, if it exists, taking in account the "List.ParentID" and "overrideParent" attributes
    const merged = parent ? mergeValueWithParent(parsed, parent) : parsed;

    cache.set(filePath, merged);
    if (context.debug) {
      writeFile(path.join(__dirname, ".dev", file), await fileData, { encoding: "utf8" }, (err) => {});
      logJson(raw, file + ".raw");
      logJson(merged, file + ".merged");
      logJson(parsed, file);
    }
    return merged as T;
  } catch (e) {
    console.error(`Error parsing xml file ${file}`, e);
  }

  return undefined;
}

/* [Step 1]
 * We parse an XML file into a JS object, using xml2js. This returns an key value object, where the key is the XML tag name, and the value is an array of all items with that tag in that position of the tree.
 * all tag attributes will be stored in the $attr key, and all child tags will be stored in their own key, again.
 * Example
 * ```
 * <root>
 *  <Group name="MyList" comment="just testing">
 *    <Item name="Foo" value="1" List.ItemID="1234" overrideParent="True" />
 *    <Item name="Bar" value="2"  />
 * </Group>
 * </root>
 * will become
 * {
 *  Group: [{
 *    $attr: {
 *     name: "MyList",
 *    comment: "just testing"
 *   },
 *  Item: [{
 *   $attr: {
 *    name: "Item1",
 *    value: "1",
 *    "List.ItemID": "1234",
 *    overrideParent: true
 *  }, {
 *   $attr: {
 *    name: "Item2",
 *    value: "2"
 *  }]
 * }]
 * }
 * ```
 */
const attrkey = "$attr" as const;
type AttribXML = {
  [attrkey]: {
    name?: string;
    value?: string;
    // There are actually very few of cases where the `overrideParent` is false, but it's still a thing to consider
    overrideParent: boolean;
    "List.ItemID"?: number;
    "List.ParentItemID"?: number;
    "List.ListAction"?: "Append";
    [key: string]: any;
  } & {
    [key: string]: AttribXML[];
  };
};

const parser = new xml2js.Parser({
  attrkey,
  explicitRoot: false,
  explicitArray: true,
  attrValueProcessors: [parseNumbers, parseBooleans],
});

/* [Step 2] Parse the Attrib XML Value into a normalized structure
 * This flattens every named tag in the attrib file into a key value pair, and moves all known behavioural attributes into a another
similarly named object, prefixed with an underscore.
 * The example in [Step 1] would become
 * ```
 * {
 * MyList: {
 *   Foo: 1,
 *   Bar: 2
 *   _Foo: {
 *    parentId: 1234,
 *    overrideParent: true
 *   },
 * },
 * _MyList: {
 *  comment: "just testing"
 *  }
 * }
 * ```
 */

function parseAttribObject(xml: AttribXML) {
  const { children: properties, name, value, attrs, meta } = parseAttribItem(xml);
  const metaObj = meta ? { [`_${name}`]: meta } : {};
  if (name && !value) return { [name]: { ...attrs, ...properties }, ...metaObj };
  else if (name) return { [name]: value, ...attrs, ...properties, ...metaObj };
  else return { ...attrs, ...properties };
}

/** Parses the properties, attributes and meta value any Attrib XML Value into a normalized structure */
function parseAttribItem(xml: AttribXML) {
  const { $attr, ...children } = xml;
  let { name, value, overrideParent, comment, ...attrs } = $attr || {};
  const id = attrs["List.ItemID"];
  const parentId = attrs["List.ParentItemID"];
  const append = attrs["List.ListAction"] === "Append";
  delete attrs["List.ItemID"];
  delete attrs["List.ParentItemID"];
  if (append) delete attrs["List.ListAction"];
  const meta = { id, parentId, override: overrideParent, comment };
  value = formatValue(value);

  return {
    name,
    value,
    attrs,
    children: Object.keys(children).length ? parseChildren(children) : undefined,
    meta: Object.values(meta).some((x) => x != undefined) ? meta : undefined,
  };
}

function parseValue(xml: AttribXML): [string, any, any] {
  const { children, name, value, attrs, meta } = parseAttribItem(xml);
  if (Object.keys(attrs).length > 0) return [name!, { value, ...attrs }, meta];
  return [name!, children ? { value, ...children } : value, meta];
}

function parseChildren(children: Record<string, AttribXML[]>) {
  let parsed = {};
  for (const [type, chs] of Object.entries(children)) {
    if (type === "list")
      // "List" tags are treaded as a key value object
      for (const l of Object.values(chs)) {
        const [name, value, meta] = parseList(l);
        parsed[name] = value;
        if (meta) parsed[`_${name}`] = meta;
      }
    else
      for (const c of Object.values(chs)) {
        const [name, value, meta] = parseValue(c);
        parsed[name] = value;
        if (meta) parsed[`_${name}`] = meta;
      }
  }

  parsed = Object.fromEntries(Object.entries(parsed).sort(([a], [b]) => (a.startsWith("_") ? 1 : b.startsWith("_") ? -1 : 0)));
  return parsed;
}

function parseList(xml: AttribXML): [string, any, any] {
  const { $attr, ...children } = xml;
  const { meta } = parseAttribItem(xml);
  // "List" tags are treaded as a key value object
  const list = Object.entries(children).flatMap(([tag, objs]) => (objs as AttribXML[]).map((o) => (tag === "list" ? Object.fromEntries([parseList(o)]) : parseAttribObject(o))));
  return [xml.$attr.name!, list, meta];
}

// Normalize the value to be a string, and replace all backslashe path value with forward slashes
function formatValue(value: any) {
  return typeof value === "string" ? value!.replace(/\\/g, "/") : value;
}

/* [Step 3] Merge the parsed Attrib XML into a single object
 * Using our normalized structure, we can now merge the parsed attrib with the parent attrib
 * This is done by deeply merging the child attrib values onto a copy of the parent attrib values
 * Here we use the underscore prefixed meta values to determine how to merge the values
 * If the meta value specifies overrideParent, then the parent value is ignored, in all other case values are merged
 * If the meta value specifies parentId, and the value is in a list, then we use it to lookup that the parent value in the parent list
 * in other cases we use the parentId to validate that both they child and parent with the same name share the same ID.
 */
function mergeObjectWithParent<T extends { [key: string]: any }>(child: T, parent: T) {
  const childKeys = Object.fromEntries(Object.entries(child).filter(([k]) => !k.startsWith("_")));
  if (!parent) return childKeys;
  const parentKeys = Object.fromEntries(Object.entries(parent).filter(([k]) => !k.startsWith("_")));
  const childMeta = Object.fromEntries(
    Object.entries(child)
      .filter(([k]) => k.startsWith("_"))
      .map(([k, v]) => [k.slice(1), v])
  );

  let merged = { ...parent } as any;
  for (const [key, value] of Object.entries(childKeys)) {
    if (value === undefined) continue;
    if (childMeta.id && childMeta.parentId && childMeta.id !== childMeta.parentId)
      console.error("Child has id and parentId but they are not the same", childMeta.id, childMeta.parentId);
    if (childMeta[key]?.override) merged[key] = value;
    else if (parentKeys[key] && Array.isArray(value) && Array.isArray(parentKeys[key])) merged[key] = mergeArrayWithParent(value, parentKeys[key]);
    else if (parentKeys[key] && typeof value === "object" && typeof parentKeys[key] === "object") merged[key] = mergeValueWithParent(value, parentKeys[key]);
    else merged[key] = value;
  }
  return merged;
}

function mergeArrayWithParent<T extends any[]>(child: T, parent: T) {
  const result = [...parent];
  for (const c of child) {
    const maybeIdKey = Object.keys(c).find((k) => k.startsWith("_") && c[k].id);
    const maybeId = maybeIdKey ? c[maybeIdKey].id : undefined;
    const maybeReplaceIndex = maybeId && result.findIndex((r) => r[maybeIdKey!]?.id === maybeId);
    if (maybeReplaceIndex !== -1 && c[maybeIdKey!]?.override) result[maybeReplaceIndex] = c;
    else if (maybeReplaceIndex !== -1) result[maybeReplaceIndex] = mergeValueWithParent(c, result[maybeReplaceIndex]);
    else result.push(c);
  }

  return result;
}

function mergeValueWithParent<T>(child: T, parent: T) {
  if (Array.isArray(child) && Array.isArray(parent)) return mergeArrayWithParent(child, parent);
  else if (Array.isArray(child)) return child;
  else if (Array.isArray(parent)) return parent;
  else return mergeObjectWithParent(child!, parent!);
}

// -----

export function logJson(data: any, name = Date.now().toString() + ".json") {
  writeJson(path.join(__dirname, ".dev", name + ".json"), data, { log: false });
}

export async function parseXmlFile<T extends NormalizedAttrib>(file: string, context: RunContext): Promise<T | undefined> {
  return getXmlData<T>(file, path.join(ATTRIB_FOLDER, "instances"), context);
}
