import { i18nConfig } from "./translations";

export interface TableMenuItems {
  insertColumnRight: { text: string };
  insertColumnLeft: { text: string };
  insertRowUp: { text: string };
  insertRowDown: { text: string };
  mergeCells: { text: string };
  unmergeCells: { text: string };
  deleteColumn: { text: string };
  deleteRow: { text: string };
  deleteTable: { text: string };
}

export interface TableConfig {
  operationMenu: {
    items: TableMenuItems;
  };
  backgroundColors: {
    colors: string[];
    text: string;
  };
}

export const defaultColors = ["#dbc8ff", "#6918b4", "#4a90e2", "#999", "#fff"];

export const getTableConfig = (i18n: keyof typeof i18nConfig): TableConfig => {
  const configs: Record<keyof typeof i18nConfig, TableConfig> = {
    en: {
      operationMenu: {
        items: {
          insertColumnRight: { text: "Insert column right" },
          insertColumnLeft: { text: "Insert column left" },
          insertRowUp: { text: "Insert row above" },
          insertRowDown: { text: "Insert row below" },
          mergeCells: { text: "Merge cells" },
          unmergeCells: { text: "Unmerge cells" },
          deleteColumn: { text: "Delete column" },
          deleteRow: { text: "Delete row" },
          deleteTable: { text: "Delete table" },
        },
      },
      backgroundColors: {
        colors: defaultColors,
        text: i18nConfig.en.tableBackground,
      },
    },
    zh: {
      operationMenu: {
        items: {
          insertColumnRight: { text: "右侧插入列" },
          insertColumnLeft: { text: "左侧插入列" },
          insertRowUp: { text: "上方插入行" },
          insertRowDown: { text: "下方插入行" },
          mergeCells: { text: "合并单元格" },
          unmergeCells: { text: "取消单元格合并" },
          deleteColumn: { text: "删除列" },
          deleteRow: { text: "删除行" },
          deleteTable: { text: "删除表格" },
        },
      },
      backgroundColors: {
        colors: defaultColors,
        text: i18nConfig.zh.tableBackground,
      },
    },
    es: {
      operationMenu: {
        items: {
          insertColumnRight: { text: "Insertar columna a la derecha" },
          insertColumnLeft: { text: "Insertar columna a la izquierda" },
          insertRowUp: { text: "Insertar fila arriba" },
          insertRowDown: { text: "Insertar fila abajo" },
          mergeCells: { text: "Combinar celdas" },
          unmergeCells: { text: "Separar celdas" },
          deleteColumn: { text: "Eliminar columna" },
          deleteRow: { text: "Eliminar fila" },
          deleteTable: { text: "Eliminar tabla" },
        },
      },
      backgroundColors: {
        colors: defaultColors,
        text: i18nConfig.es.tableBackground,
      },
    },
  };

  return configs[i18n];
};

export const getCodeLanguages = () => [
  { key: "plain", label: "Plain" },
  { key: "javascript", label: "Javascript" },
  { key: "java", label: "Java" },
  { key: "python", label: "Python" },
  { key: "cpp", label: "C++/C" },
  { key: "csharp", label: "C#" },
  { key: "php", label: "PHP" },
  { key: "sql", label: "SQL" },
  { key: "json", label: "JSON" },
  { key: "bash", label: "Bash" },
  { key: "go", label: "Go" },
  { key: "objectivec", label: "Object-C" },
  { key: "xml", label: "Html/xml" },
  { key: "css", label: "CSS" },
  { key: "ruby", label: "Ruby" },
  { key: "swift", label: "Swift" },
  { key: "scala", label: "Scala" },
];

export const getDefaultFontList = () => [
  "system", 
  "wsYaHei", 
  "songTi", 
  "serif", 
  "arial"
];

export const getDefaultSizeList = () => [
  "12px", 
  "14px", 
  "18px", 
  "36px"
]; 