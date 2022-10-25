import path from "path";
import fs from "fs/promises";
import xml2js from "xml2js";
import { parseBooleans, parseNumbers } from "xml2js/lib/processors";

const attrkey = "$attr";
const parser = new xml2js.Parser({
  attrkey,
  explicitRoot: false,
  explicitArray: true,
  attrValueProcessors: [parseNumbers, parseBooleans],
});

type parsedXmlValues = any | parsedXmlValues[] | { [key: string]: parsedXmlValues };
type parsedXml = Record<string, parsedXmlValues>;

export async function parseXml(xml: string | Promise<string>): Promise<parsedXml> {
  const body = await parser.parseStringPromise(await xml);

  return parseObject(body);
}

type XML = {
  [attrkey]: {
    name?: string;
    value?: string;
    overrideParent: boolean;
    [key: string]: any;
  } & {
    [key: string]: XML[];
  };
};

function parseObject(xml: XML) {
  const { $attr, ...children } = xml;
  let { name, value, overrideParent, comment, ...attrs } = $attr || {};
  value = formatValue(value);
  const properties = parseProperties(children);
  if (name && !value) return { [name]: { ...attrs, ...properties } };
  else if (name) return { [name]: value, ...attrs, ...properties };
  else return { ...attrs, ...properties };
}

function parseList(xml: XML): [string, any] {
  const { $attr, ...children } = xml;
  const list = Object.entries(children).flatMap(([tag, objs]) => (objs as XML[]).map((o) => (tag === "list" ? Object.fromEntries([parseList(o)]) : parseObject(o))));
  return [xml.$attr.name!, list];
}

function parseValue(xml: XML): [string, any] {
  const { $attr, ...children } = xml;
  let { name, value, overrideParent, comment, ...attrs } = $attr || {};
  value = formatValue(value);
  if (Object.keys(attrs).length > 0) return [name!, { value, ...attrs }];
  return [name!, Object.keys(children).length ? { value, ...parseProperties(children) } : value];
}

function parseProperties(children: Record<string, XML[]>) {
  let properties = {};
  for (const [type, chs] of Object.entries(children)) {
    if (type === "list")
      for (const l of Object.values(chs)) {
        const [name, value] = parseList(l);
        properties[name] = value;
      }
    else
      for (const c of Object.values(chs)) {
        const [name, value] = parseValue(c);
        properties[name] = value;
      }
  }

  return properties;
}

function formatValue(value: any) {
  return typeof value === "string" ? value!.replace(/\\/g, "/") : value;
}

const cache = new Map<string, any>();

export async function parseXmlFile<T = any>(file: string): Promise<T | undefined> {
  if (cache.has(file)) return cache.get(file);
  try {
    const fileData = fs.readFile(file, "utf-8");
    const parsed = parseObject(await parser.parseStringPromise(await fileData)) as T;
    cache.set(file, parsed);
    return parsed;
  } catch (e) {
    console.error(`Error parsing xml file ${file}`, e);
  }

  return undefined;
}

export { parseObject };
