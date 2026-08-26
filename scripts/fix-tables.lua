-- fix-tables.lua
-- Filtro Lua para Pandoc que converte tabelas Markdown em blocos LaTeX puros.
-- Implementa:
-- 1. Grelha completa (linhas verticais e horizontais)
-- 2. Larguras proporcionais ao conteúdo
-- 3. Ambiente `tabela` personalizado do utilizador
-- 4. Fonte reduzida (\small)

function Table(el)
    local num_cols = #el.colspecs
    if num_cols == 0 then return el end

    -- Calcular o comprimento máximo de texto por coluna para decidir proporções
    local max_len = {}
    for i = 1, num_cols do max_len[i] = 5 end -- mínimo de 5 caracteres

    local function update_max(cells)
        for i, cell in ipairs(cells) do
            if i <= num_cols then
                local text = pandoc.utils.stringify(cell.contents)
                if #text > max_len[i] then max_len[i] = #text end
            end
        end
    end

    if el.head and el.head.rows then
        for _, row in ipairs(el.head.rows) do update_max(row.cells) end
    end
    for _, body in ipairs(el.bodies) do
        for _, row in ipairs(body.body) do update_max(row.cells) end
    end

    local total_len = 0
    for i = 1, num_cols do total_len = total_len + max_len[i] end

    local proportions = {}
    local sum = 0
    for i = 1, num_cols do
        local prop = max_len[i] / total_len
        if prop < 0.06 then prop = 0.06 end
        proportions[i] = prop
        sum = sum + prop
    end
    
    local colspecs_str = ""
    for i = 1, num_cols do
        local p = proportions[i] / sum
        local align = tostring(el.colspecs[i][1])
        local p_def = "p{" .. string.format("%.2f", p * 0.92) .. "\\textwidth}"
        
        if align == "AlignCenter" then
            p_def = ">{\\centering\\arraybackslash}" .. p_def
        elseif align == "AlignRight" then
            p_def = ">{\\raggedleft\\arraybackslash}" .. p_def
        elseif align == "AlignLeft" then
            p_def = ">{\\raggedright\\arraybackslash}" .. p_def
        end
        
        colspecs_str = colspecs_str .. "|" .. p_def
    end
    colspecs_str = colspecs_str .. "|"

    local latex = "\\begin{tabela}[htbp]\n\\small\n\\centering\n"
    latex = latex .. "\\begin{tabular}{" .. colspecs_str .. "}\n\\hline\n"

    local function write_cells(cells, is_header)
        local row_str = ""
        for i, cell in ipairs(cells) do
            -- Converter o conteúdo da célula (AST) para LaTeX usando o writer do Pandoc
            local cell_latex = pandoc.write(pandoc.Pandoc(cell.contents), 'latex')
            -- Limpar espaços/newlines extra no final
            cell_latex = cell_latex:gsub("%s+$", "")
            
            if is_header then
                row_str = row_str .. "\\textbf{" .. cell_latex .. "}"
            else
                row_str = row_str .. cell_latex
            end
            
            if i < #cells then 
                row_str = row_str .. " & " 
            end
        end
        return row_str .. " \\\\\n\\hline\n"
    end

    if el.head and el.head.rows then
        for _, row in ipairs(el.head.rows) do
            latex = latex .. write_cells(row.cells, true)
        end
    end

    for _, body in ipairs(el.bodies) do
        for _, row in ipairs(body.body) do
            latex = latex .. write_cells(row.cells, false)
        end
    end

    latex = latex .. "\\end{tabular}\n"
    
    -- Tratar da legenda (caption)
    if el.caption and el.caption.long and #el.caption.long > 0 then
        local cap_latex = pandoc.write(pandoc.Pandoc(el.caption.long), 'latex')
        cap_latex = cap_latex:gsub("%s+$", "")
        local short_cap = cap_latex:gsub("%.?%s*Fonte:.*$", ""):gsub("%s+$", "")
        latex = latex .. "\\caption[" .. short_cap .. "]{" .. cap_latex .. "}\n"
    end

    latex = latex .. "\\end{tabela}\n"

    return pandoc.RawBlock('latex', latex)
end
