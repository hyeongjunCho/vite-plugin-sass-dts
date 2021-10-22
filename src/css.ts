import { getPreprocessorOptions } from "./options";
import { renderSync } from "sass";
import { AdditionalData, CSS } from "./type";
import { UserConfig } from "vite";

const SPLIT_STR = `/* vite-plugin-sass-dts */\n`;

export const parseCss = async (
  file: Buffer,
  fileName: string,
  config: UserConfig
): Promise<CSS> => {
  const { additionalData, includePaths, importer } =
    getPreprocessorOptions(config);

  const result = renderSync({
    data: await getData(file.toString(), fileName, additionalData),
    includePaths,
    importer,
  });

  const splitted = result.css.toString().split(SPLIT_STR);
  return { localStyle: splitted[1] || '', globalStyle: splitted[0] };
};

const getData = (
  data: string,
  filename: string,
  additionalData?: AdditionalData
): string | Promise<string> => {
  if (!additionalData) return `\n${SPLIT_STR}${data}`;
  if (typeof additionalData === "function") {
    return additionalData(`\n${SPLIT_STR}${data}`, filename);
  }
  return `${additionalData}\n${SPLIT_STR}${data}`;
};
