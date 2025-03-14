<#
.SYNOPSIS
Extracts and prepares Age of Empires IV game assets for use in the aoe4world data project.

.PARAMETER GamePath
Use the assets from the specified game directory. This would be C:\Program Files (x86)\Steam\steamapps\common\Age of Empires IV, if it was installed in the default Steam directory.

.PARAMETER ArchivesPath
Use the Attrib.sga, UIArt.sga and LocaleEnglish.sga files in the specified directory. defaults to './source' if all 3 files are found there.

.PARAMETER DataStorePath
Specifies the directory that contains an archival storage of multiple game versions, it should contain a 'patches\{patch-version}' structure. Use -Patch to specify which patch to extract.
This option will extract to 'exports\{patch-version}' in the specified directory.

.PARAMETER Patch
The patch to use in the DataStore; eg. 12.2.3372

.PARAMETER OutputPath
Where to extract the data to; defaults to './source/{version}' (and create junction from ./source/latest to it)

.PARAMETER ExtractXml
Whether to also convert the attribs to xml format (into {OutputPath}/attrib-raw/xml)

.PARAMETER ExtractExtraImages
Whether to extracts all icons instead of only races, also extracts civ flags & map images.

.PARAMETER RemoveTemp
Removes the extracted sga content after conversion (attrib-raw and uiart-raw dirs)

.PARAMETER AOEModsEssenceDir
Specify an alternative dir containing 'AOEMods.Essence.CLI.dll'; defaults to './source/AOEMods.Essence'

.EXAMPLE

.\Extract-AOE4Patch.ps1 -GamePath 'C:\Program Files (x86)\Steam\steamapps\common\Age of Empires IV\'

Simply extract the required data for the explorer from your default Steam AoE4 installation.

.EXAMPLE

.\Extract-AOE4Patch.ps1 -GamePath 'C:\Program Files (x86)\Steam\steamapps\common\Age of Empires IV\' -ExtractExtraImages -RemoveTemp

Extract the required data, but also export map, civ and additional icons (these won't be used by the explorer). Also Remove temporary files.

.EXAMPLE

.\Extract-AOE4Patch.ps1 -RemoveTemp

After manually placing Attrib.sga, UIArt.sga and LocaleEnglish.sga in ./sources. This simply extracts the necessary resources and removes the temporary files.
#>
[CmdletBinding(DefaultParameterSetName = 'ArchivePath')]
param(
  [Parameter(Mandatory, ParameterSetName = 'GamePath')]
  [String]$GamePath,

  [Parameter(Mandatory, ParameterSetName = 'ArchivesPath')]
  [String]$ArchivesPath,

  [Parameter(Mandatory, ParameterSetName = 'DataStore')]
  [String]$DataStorePath,
  [Parameter(Mandatory, ParameterSetName = 'DataStore')]
  [Parameter(ParameterSetName = 'ArchivesPath')]
  [String]$Patch,

  [String]$OutputPath,
  [Switch]$ExtractXml,
  [Switch]$ExtractExtraImages,
  [Switch]$RemoveTemp,

  [String]$AOEModsEssenceDir
)

$ErrorActionPreference = 'Stop'

if ($DataStorePath) {
  $ArchivesPath = Join-Path $DataStorePath "patches\$Patch\cardinal\archives"
  $OutputPath = Join-Path $DataStorePath "exports\$Patch"
  Write-Host "Selected $ArchivesPath as source directory"
  Write-Host "Selected $OutputPath as output directory"
}

if ($GamePath) {
  $ArchivesPath = Join-Path $GamePath 'cardinal\archives'
  if (-not (Test-Path $ArchivesPath)) {
    Write-Error "The path $GamePath doesn't point to the game directory, this often is C:\Program Files (x86)\Steam\steamapps\common\Age of Empires IV"
    return
  }
  Write-Host "Selected $ArchivesPath as source directory"
} elseif (-not $ArchivesPath) {
  $ArchivesPath = Join-Path $PSScriptRoot 'source'
  if ((Test-Path (Join-Path $ArchivesPath 'Attrib.sga')) -and
      (Test-Path (Join-Path $ArchivesPath 'LocaleEnglish.sga')) -and
      (Test-Path (Join-Path $ArchivesPath 'UIArt.sga'))) {
    Write-Host "Selected $ArchivesPath as default archives directory, since it contained Attrib.sga, LocaleEnglish.sga, and UIArt.sga files. Provide -GamePath or -ArchivesPath if another source is desired."
  }
}

if (-not (Test-Path (Join-Path $ArchivesPath 'Attrib.sga')) -or
    -not (Test-Path (Join-Path $ArchivesPath 'LocaleEnglish.sga')) -or
    -not (Test-Path (Join-Path $ArchivesPath 'UIArt.sga'))) {
  Write-Error "Specify -GamePath with path the the game; or specify -ArchivesPath with directory containing Attrib.sga, LocaleEnglish.sga, and UIArt.sga; or place those files in $ArchivesPath"
  return
}

$OutputLatestPath = Join-Path $PSScriptRoot 'source/latest'

if (-not $OutputPath) {
  if (-not (Test-Path $OutputLatestPath) -or (Get-Item $OutputLatestPath).LinkType -eq 'Junction') {
    if ($GamePath -and (Test-Path "$GamePath\RelicCardinal.exe")) {
      $BinaryVersion = (Get-Item "$GamePath\RelicCardinal.exe").VersionInfo.ProductVersion -replace '^(\d+\.\d+\.\d+).*', '$1'
      $OutputPath = Join-Path $PSScriptRoot "source/$BinaryVersion"
      Write-Host "Found game version ${BinaryVersion} in $GamePath..."
    } elseif ($Patch) {
      $OutputPath = Join-Path $PSScriptRoot "source/$Patch"
      Write-Host "Using game version ${Patch} as specified."
    } else {
      Write-Error "Cannot create versioned dir in ./source and update the junction/symlink ./source/latest without a version number, provide one via -Path or preferably use -GamePath method instead of -ArchivesPath"
      return
    }
  } elseif (Test-Path $OutputLatestPath) {
    Write-Warning "Using ./source/latest path as OutputPath since it already exists and isn't a junction. Clean up ./source and rerun the script if you want to switch to multi-version support."
  }

  if (-not $OutputPath) {
    $OutputPath = $OutputLatestPath
  }

  Write-Host "Selected $OutputPath as output directory"
}

if (-not $AOEModsEssenceDir) {
  $AOEModsEssenceDir = Join-Path $PSScriptRoot 'source/AOEMods.Essence'
  $AOEModsEssencePath = Join-Path $AOEModsEssenceDir 'AOEMods.Essence.CLI.dll'
}

if (-not (Test-Path $AOEModsEssencePath)) {
  Write-Error "AOEMods.Essence.CLI.dll doesn't exist in $AOEModsEssencePath, download it from https://github.com/aoemods/AOEMods.Essence/releases"
  return
}

function Export-Attrib($patch) {
  $sgaPath = "$ArchivesPath\Attrib.sga"

  $outPath = $OutputPath
  $rawPath = "${outPath}\attrib-raw"
  $rgdPath = "${rawPath}\rgd"
  $xmlPath = "${rawPath}\xml"
  $attribPath = "${outPath}\attrib"

  if (Test-Path $rawPath) {
    Write-Host "Removing existing $rawPath"
    Remove-Item -Recurse $rawPath
  }

  if (Test-Path $attribPath) {
    Write-Host "Removing existing $attribPath"
    Remove-Item -Recurse $attribPath
  }

  $null = [System.IO.Directory]::CreateDirectory($outPath)
  $null = [System.IO.Directory]::CreateDirectory($rawPath)
  $null = [System.IO.Directory]::CreateDirectory($rgdPath)
  if ($ExtractXml) {
    $null = [System.IO.Directory]::CreateDirectory($xmlPath)
  }
  $null = [System.IO.Directory]::CreateDirectory($attribPath)

  Write-Host "Unpacking $sgaPath to $rgdPath"
  dotnet $AOEModsEssencePath sga-unpack $sgaPath $rgdPath
  if ($ExtractXml) {
    dotnet $AOEModsEssencePath rgd-decode "$rgdPath\attrib" $xmlPath -b
  }
  dotnet $AOEModsEssencePath rgd-decode "$rgdPath\attrib" $attribPath -b -f json

  if  ($RemoveTemp) {
    Remove-Item -Recurse $rawPath
  }
}

function Export-Locale {
  $sgaPath = "$ArchivesPath\\LocaleEnglish.sga"

  $outPath = $OutputPath
  $localePath = "${outPath}\locale"

  if (Test-Path $localePath) {
    Write-Host "Removing existing $localePath"
    Remove-Item -Recurse $localePath
  }

  $null = [System.IO.Directory]::CreateDirectory($outPath)
  $null = [System.IO.Directory]::CreateDirectory($localePath)

  Write-Host "Unpacking $sgaPath to $localePath"
  dotnet $AOEModsEssencePath sga-unpack $sgaPath $localePath
}

function Export-Icons {
  $sgaPath = "$ArchivesPath\\UIArt.sga"

  $outPath = $OutputPath
  $uiartPath = "${outPath}\uiart-raw"

  $uiPath = "${outPath}\ui"
  $iconsPath = "${outPath}\ui\icons"
  $racesPath = "${outPath}\ui\icons\races"
  $mapsPath = "${outPath}\ui\images\map_gen_layout"
  $civFlagsPath = "${outPath}\ui\images\civ_flags"

  if (Test-Path $uiartPath) {
    Write-Host "Removing existing $uiartPath"
    Remove-Item -Recurse $uiartPath
  }

  if (Test-Path $uiPath) {
    Write-Host "Removing existing $uiPath"
    Remove-Item -Recurse $uiPath
  }

  $null = [System.IO.Directory]::CreateDirectory($outPath)
  $null = [System.IO.Directory]::CreateDirectory($uiartPath)
  $null = [System.IO.Directory]::CreateDirectory($iconsPath)
  $null = [System.IO.Directory]::CreateDirectory($racesPath)
  if ($ExtractExtraImages) {
    $null = [System.IO.Directory]::CreateDirectory($mapsPath)
    $null = [System.IO.Directory]::CreateDirectory($civFlagsPath)
  }

  Write-Host "Unpacking $sgaPath to $uiartPath"
  dotnet $AOEModsEssencePath sga-unpack $sgaPath $uiartPath

  if ($ExtractExtraImages) {
    dotnet $AOEModsEssencePath rrtex-decode $uiartPath\ui\icons $iconsPath -b
    dotnet $AOEModsEssencePath rrtex-decode $uiartPath\ui\images\map_gen_layout $mapsPath -b
    dotnet $AOEModsEssencePath rrtex-decode $uiartPath\ui\images\civ_flags $civFlagsPath -b
  } else {
    dotnet $AOEModsEssencePath rrtex-decode $uiartPath\ui\icons\races $racesPath -b
  }
  #dotnet $AOEModsEssencePath rrtex-decode $uiartPath $iconsPath -b

  if  ($RemoveTemp) {
    Remove-Item -Recurse $uiartPath
  }
}

Export-Attrib
Export-Locale
Export-Icons

if ($OutputLatestPath -ne $OutputPath -and (-not (Test-Path $OutputLatestPath) -or (Get-Item $OutputLatestPath).LinkType -eq 'Junction')) {
  Write-Host "Updating $OutputLatestPath to point to $OutputPath"
  if (Test-Path $OutputLatestPath) {
    (Get-Item $OutputLatestPath).Delete()
  }
  $null = New-Item $OutputLatestPath -ItemType 'Junction' -Value $OutputPath
}