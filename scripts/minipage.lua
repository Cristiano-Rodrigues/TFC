function Div(el)
    if el.classes:includes("keep-together") then
        local blocks = {pandoc.RawBlock('latex', '\\noindent\\begin{minipage}{\\linewidth}\n\\captionsetup{type=figure}\n\\centering')}
        for _, b in ipairs(el.content) do
            table.insert(blocks, b)
        end
        table.insert(blocks, pandoc.RawBlock('latex', '\\end{minipage}\\vspace{1em}'))
        return blocks
    end
end
