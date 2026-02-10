
import { GoogleGenAI, Type } from "@google/genai";
import { Table } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTableFromPrompt = async (prompt: string): Promise<Partial<Table>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `O usuário quer criar uma tabela financeira brasileira. Contexto: "${prompt}". 
    Gere uma estrutura de tabela (nome, descrição, colunas e exemplos de linhas).
    
    REGRAS DE TIPAGEM:
    - Colunas que representam dinheiro (preços, salários, custos, totais) DEVEM ter o tipo 'currency'.
    - Colunas de texto fixo como 'Categoria' ou 'Status' usam 'string'.
    - Colunas de data usam 'date'.
    - Colunas de marcar usam 'checkbox'.
    
    REGRAS PARA LINHAS:
    Para cada linha em 'rows', forneça um array 'rowValues'.
    Cada item em 'rowValues' deve ter 'columnKey' e 'cellValue' (o conteúdo bruto sem símbolo R$).
    
    Exemplo: Para um valor de R$ 1.500,00, o cellValue deve ser "1500.00".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          columns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["key", "label", "type"]
            }
          },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rowValues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      columnKey: { type: Type.STRING },
                      cellValue: { type: Type.STRING }
                    },
                    required: ["columnKey", "cellValue"]
                  }
                }
              },
              required: ["rowValues"]
            }
          }
        },
        required: ["name", "description", "columns", "rows"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Resposta vazia da IA");
  
  const data = JSON.parse(text);

  const mappedRows = data.rows.map((row: any) => {
    const rowObj: any = { id: crypto.randomUUID() };
    
    row.rowValues.forEach((cell: any) => {
      const column = data.columns.find((c: any) => c.key === cell.columnKey);
      
      if (column?.type === 'checkbox') {
        rowObj[cell.columnKey] = cell.cellValue === 'true' || cell.cellValue === true;
      } else if (column?.type === 'number' || column?.type === 'currency') {
        rowObj[cell.columnKey] = parseFloat(cell.cellValue) || 0;
      } else {
        rowObj[cell.columnKey] = cell.cellValue;
      }
    });

    data.columns.forEach((col: any) => {
      if (rowObj[col.key] === undefined) {
        rowObj[col.key] = col.type === 'checkbox' ? false : (col.type === 'number' || col.type === 'currency') ? 0 : '';
      }
    });

    return rowObj;
  });

  return {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    columns: data.columns.map((c: any) => ({ 
      ...c, 
      aggregation: (c.type === 'currency' || c.type === 'number') ? 'sum' : 'none' 
    })),
    rows: mappedRows,
    themeColor: '#10b981',
    createdAt: new Date().toISOString()
  };
};

export const getFinancialAdvice = async (tables: Table[], userPrompt: string): Promise<string> => {
  const context = tables.map(t => `${t.name}: ${JSON.stringify(t.rows)}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Você é um consultor financeiro brasileiro especialista. Aqui estão as tabelas do usuário:\n${context}\n\nPergunta do usuário: ${userPrompt}\nResponda de forma curta, prestativa e amigável em Português do Brasil. Sempre use R$ ao citar valores.`,
  });
  return response.text || "Desculpe, não consegui processar seu pedido.";
};
