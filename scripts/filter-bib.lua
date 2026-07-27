-- filter-bib.lua
-- Pandoc Lua filter to separate internet sources into a "Fontes Consultadas" section.
-- The section is numbered as a continuation of Bibliografia but is omitted from the TOC (Sumário).

local internet_keys = {}
local bib_loaded = false

local function load_bib_keys()
  if bib_loaded then return end
  bib_loaded = true

  local bib_file = "docs/references.bib"
  local f = io.open(bib_file, "r")
  if not f then return end
  local content = f:read("*a")
  f:close()

  local pos = 1
  while true do
    local s, e, etype, key = content:find("@(%a+)%s*%{%s*([%w%_%-%:]+)%s*,", pos)
    if not s then break end

    local next_s = content:find("[\r\n]+@", e)
    local block
    if next_s then
      block = content:sub(s, next_s)
    else
      block = content:sub(s)
    end

    pos = e

    etype = etype:lower()
    local is_internet = false
    if etype == "online" or etype == "webpage" or etype == "www" then
      is_internet = true
    elseif etype == "misc" then
      local lower_block = block:lower()
      if lower_block:find("url") or lower_block:find("howpublished") then
        is_internet = true
      end
    end

    if is_internet then
      internet_keys[key] = true
    end
  end
end

function Div(el)
  if el.classes:includes("references") or el.id == "refs" then
    load_bib_keys()

    local main_entries = {}
    local internet_entries = {}

    for _, child in ipairs(el.content) do
      if child.t == "Div" and child.identifier then
        local key = child.identifier:gsub("^ref%-", "")
        if internet_keys[key] then
          table.insert(internet_entries, child)
        else
          table.insert(main_entries, child)
        end
      else
        table.insert(main_entries, child)
      end
    end

    if #internet_entries == 0 then
      return el
    end

    local result = {}

    -- Main bibliography Div
    local main_div = pandoc.Div(main_entries, el.attr)
    table.insert(result, main_div)

    -- "Fontes Consultadas" subtitle:
    -- Rendered with LaTeX section/subsection numbering but excluded from TOC via \let\addcontentsline\@gobblethree
    local subtitle_latex = pandoc.RawBlock(
      'latex',
      '\\vspace{1.5em}\\begingroup\\makeatletter\\let\\addcontentsline\\@gobblethree\\subsection{Fontes Consultadas}\\makeatother\\endgroup'
    )
    table.insert(result, subtitle_latex)

    -- Internet bibliography Div
    local internet_attr = pandoc.Attr("refs-internet", el.classes, el.attributes)
    local internet_div = pandoc.Div(internet_entries, internet_attr)
    table.insert(result, internet_div)

    return result
  end
end
