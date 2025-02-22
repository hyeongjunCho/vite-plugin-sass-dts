"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => Plugin
});
module.exports = __toCommonJS(src_exports);
var import_prettier2 = __toESM(require("prettier"), 1);

// src/main.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_postcss = require("postcss");
var import_postcss_js = require("postcss-js");

// src/util.ts
var import_node_path = __toESM(require("path"), 1);
var cssLangs = `\\.(css|sass|scss)($|\\?)`;
var cssLangReg = new RegExp(cssLangs);
var cssModuleReg = new RegExp(`\\.module${cssLangs}`);
var importCssRE = /@import ('[^']+\.css'|"[^"]+\.css"|[^'")]+\.css)/;
var isCSSModuleRequest = (request) => cssModuleReg.test(request);
var getRelativePath = (from, to) => {
  const relativePath = (import_node_path.default.relative(import_node_path.default.dirname(from || ""), import_node_path.default.dirname(to || "")) || "./").replace(/\\/g, "/");
  return relativePath.endsWith("..") ? `${relativePath}/` : relativePath;
};
var toDashCase = (target) => target.replace(/[-_ /~ . ][A-z0-9]/g, (v) => {
  return "-" + v.slice(1);
}).toLowerCase();
var toCamelCase = (target) => target.replace(/^[A-Z]/, (m) => m.toLowerCase()).replace(/[-_ ./~ ]+([A-z0-9])/g, (m, $1) => $1.toUpperCase());
var isSassException = (e) => typeof e === "object" && !!e && "file" in e;
var collectionToObj = (collection) => {
  return collection.reduce((acc, item) => {
    return { ...acc, ...item };
  }, {});
};

// src/options.ts
var getParseCase = (config) => {
  if (!config.css || !config.css.modules || !config.css.modules.localsConvention) {
    return;
  }
  const { localsConvention } = config.css.modules;
  if (localsConvention === "camelCase" || localsConvention === "camelCaseOnly") {
    return toCamelCase;
  } else if (localsConvention === "dashes" || localsConvention === "dashesOnly") {
    return toDashCase;
  }
  return;
};
var getPreprocessorOptions = (config) => {
  let additionalData, includePaths, importer;
  if (!config.css || !config.css.preprocessorOptions || !config.css.preprocessorOptions.scss) {
    return { additionalData, includePaths, importer };
  }
  return config.css.preprocessorOptions.scss;
};

// src/css.ts
var import_node_module = require("module");
var import_vite = require("vite");
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_meta = {};
var SPLIT_STR = `/* vite-plugin-sass-dts */
`;
var loadedSassPreprocessor;
var _require = import_meta.url ? (0, import_node_module.createRequire)(import_meta.url) : require;
var parseCss = async (file, fileName, config) => {
  const sass = loadSassPreprocessor(config);
  const options = getPreprocessorOptions(config);
  const resolveFn = config.createResolver({
    extensions: [".scss", ".sass", ".css"],
    mainFields: ["sass", "style"],
    tryIndex: true,
    tryPrefix: "_",
    preferRelative: true
  });
  const internalImporter = (url, importer, done) => {
    resolveFn(url, importer).then((resolved) => {
      if (resolved) {
        rebaseUrls(resolved, fileName, config.resolve.alias, "$").then(done).catch(done);
      } else {
        done && done(null);
      }
    });
  };
  const finalImporter = [internalImporter];
  if (options.importer) {
    Array.isArray(options.importer) ? finalImporter.push(...options.importer) : finalImporter.push(options.importer);
  }
  const data = await getData(file.toString(), fileName, options.additionalData);
  const result = await new Promise((resolve, reject) => {
    sass.render(
      {
        ...options,
        data,
        file: fileName,
        includePaths: ["node_modules"],
        importer: finalImporter
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
  const splitted = result.css.toString().split(SPLIT_STR);
  return { localStyle: splitted[1] || "", globalStyle: splitted[0] };
};
var getData = (data, filename, additionalData) => {
  if (!additionalData)
    return `
${SPLIT_STR}${data}`;
  if (typeof additionalData === "function") {
    return additionalData(`
${SPLIT_STR}${data}`, filename);
  }
  return `${additionalData}
${SPLIT_STR}${data}`;
};
var loadSassPreprocessor = (config) => {
  try {
    if (loadedSassPreprocessor) {
      return loadedSassPreprocessor;
    }
    const fallbackPaths = _require.resolve.paths?.("sass") || [];
    const resolved = _require.resolve("sass", {
      paths: [config.root, ...fallbackPaths]
    });
    return loadedSassPreprocessor = _require(resolved);
  } catch (e) {
    console.error(e);
    throw new Error(
      `Preprocessor dependency 'sass' not found. Did you install it?`
    );
  }
};
var rebaseUrls = async (file, rootFile, alias, variablePrefix) => {
  file = import_path.default.resolve(file);
  const fileDir = import_path.default.dirname(file);
  const rootDir = import_path.default.dirname(rootFile);
  if (fileDir === rootDir) {
    return { file };
  }
  const content = import_fs.default.readFileSync(file, "utf-8");
  const hasImportCss = importCssRE.test(content);
  if (!hasImportCss) {
    return { file };
  }
  let rebased;
  const rebaseFn = (url) => {
    if (url.startsWith("/"))
      return url;
    if (url.startsWith(variablePrefix))
      return url;
    for (const { find } of alias) {
      const matches = typeof find === "string" ? url.startsWith(find) : find.test(url);
      if (matches) {
        return url;
      }
    }
    const absolute = import_path.default.resolve(fileDir, url);
    const relative = import_path.default.relative(rootDir, absolute);
    return (0, import_vite.normalizePath)(relative);
  };
  if (hasImportCss) {
    rebased = await rewriteImportCss(content, rebaseFn);
  }
  return {
    file,
    contents: rebased
  };
};
var rewriteImportCss = (css, replacer) => {
  return asyncReplace(css, importCssRE, async (match) => {
    const [matched, rawUrl] = match;
    return await doImportCSSReplace(rawUrl, matched, replacer);
  });
};
var asyncReplace = async (input, re, replacer) => {
  let match;
  let remaining = input;
  let rewritten = "";
  while (match = re.exec(remaining)) {
    rewritten += remaining.slice(0, match.index);
    rewritten += await replacer(match);
    remaining = remaining.slice(match.index + match[0].length);
  }
  rewritten += remaining;
  return rewritten;
};
var doImportCSSReplace = async (rawUrl, matched, replacer) => {
  let wrap = "";
  const first = rawUrl[0];
  if (first === `"` || first === `'`) {
    wrap = first;
    rawUrl = rawUrl.slice(1, -1);
  }
  if (isExternalUrl(rawUrl) || isDataUrl(rawUrl) || rawUrl.startsWith("#")) {
    return matched;
  }
  return `@import ${wrap}${await replacer(rawUrl)}${wrap}`;
};
var externalRE = /^(https?:)?\/\//;
var isExternalUrl = (url) => externalRE.test(url);
var dataUrlRE = /^\s*data:/i;
var isDataUrl = (url) => dataUrlRE.test(url);

// src/extract.ts
var importRe = new RegExp(/^(@import|@apply)/);
var keySeparatorRe = new RegExp(/(?=[\s.:[\]><+,()])/g);
var extractClassNameKeys = (obj, toParseCase, parentKey) => {
  return Object.entries(obj).reduce(
    (curr, [key, value]) => {
      if (importRe.test(key))
        return curr;
      const splitKeys = key.split(keySeparatorRe);
      for (const splitKey of splitKeys) {
        if (parentKey === ":export" || splitKey.startsWith(".")) {
          if (toParseCase) {
            curr.set(toParseCase(splitKey.replace(".", "").trim()), true);
          } else {
            curr.set(splitKey.replace(".", "").trim(), true);
          }
        }
      }
      if (typeof value === "object" && Object.keys(value).length > 0) {
        const valueToExtract = Array.isArray(value) ? collectionToObj(value) : value;
        const map = extractClassNameKeys(valueToExtract, toParseCase, key);
        for (const key2 of map.keys()) {
          if (toParseCase) {
            curr.set(toParseCase(key2), true);
          } else {
            curr.set(key2, true);
          }
        }
      }
      return curr;
    },
    /* @__PURE__ */ new Map()
  );
};

// src/write.ts
var import_node_fs = require("fs");
var import_node_path2 = require("path");
var import_prettier = __toESM(require("prettier"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_promises = require("fs/promises");
var { format } = import_prettier.default;
var writeToFile = async (prettierOptions, fileName, classNameKeys, options) => {
  const typeName = getTypeName(import_path2.default.basename(fileName), options);
  let exportTypes = "";
  const exportStyle = "export = classNames;";
  for (const classNameKey of classNameKeys.keys()) {
    exportTypes = `${exportTypes}
${formatExportType(classNameKey, typeName)}`;
  }
  let outputFileString = "";
  if (options?.global?.outFile) {
    const relativePath = getRelativePath(
      (0, import_node_path2.dirname)(fileName),
      (0, import_node_path2.dirname)(options.global.outFile)
    );
    const exportTypeFileName = formatExportTypeFileName(options.global.outFile);
    outputFileString = `import globalClassNames from '${relativePath}${exportTypeFileName}'
`;
    outputFileString = `${outputFileString}declare const classNames: typeof globalClassNames & {${exportTypes}
};
${exportStyle}`;
  } else {
    outputFileString = `declare const classNames: {${exportTypes}
};
${exportStyle}`;
  }
  const prettierdOutputFileString = format(outputFileString, prettierOptions);
  const writePath = formatWriteFilePath(fileName, options);
  await ensureDirectoryExists(writePath);
  (0, import_node_fs.writeFile)(writePath, `${prettierdOutputFileString}`, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
};
var getTypeName = (fileName, options) => {
  if (options && options.typeName && options.typeName.replacement) {
    if (typeof options.typeName.replacement === "function") {
      return options.typeName.replacement(fileName);
    } else {
      return options.typeName.replacement;
    }
  }
  return void 0;
};
var formatExportType = (key, type = `'${key}'`) => `  readonly '${key}': ${type};`;
var formatWriteFilePath = (file, options) => {
  let path4 = file;
  const src = options?.sourceDir;
  const dist = options?.outputDir;
  if (src && !(0, import_node_path2.isAbsolute)(src)) {
    throw new Error("vite-plugin-sass-dts sourceDir must be an absolute path");
  }
  if (dist && !(0, import_node_path2.isAbsolute)(dist)) {
    throw new Error("vite-plugin-sass-dts outputDir must be an absolute path");
  }
  if (src && dist) {
    path4 = path4.replace(src, dist);
  }
  return formatWriteFileName(path4);
};
var formatWriteFileName = (file) => `${file}${file.endsWith("d.ts") ? "" : ".d.ts"}`;
var formatExportTypeFileName = (file) => (0, import_node_path2.basename)(file.replace(".ts", ""));
var ensureDirectoryExists = async (file) => {
  await (0, import_promises.mkdir)((0, import_node_path2.dirname)(file), { recursive: true });
};

// src/main.ts
var main = (fileName, config, option) => {
  try {
    import_fs2.default.readFile(fileName, async (err, file) => {
      if (err) {
        console.error(err);
      } else {
        try {
          const css = fileName.endsWith(".css") ? { localStyle: file.toString() } : await parseCss(file, fileName, config);
          const toParseCase = getParseCase(config);
          const classNameKeys = extractClassNameKeys(
            (0, import_postcss_js.objectify)((0, import_postcss.parse)(css.localStyle)),
            toParseCase
          );
          writeToFile(config.prettierOptions, fileName, classNameKeys, option);
          if (!!css.globalStyle && option.global?.generate) {
            const globalClassNameKeys = extractClassNameKeys(
              (0, import_postcss_js.objectify)((0, import_postcss.parse)(css.globalStyle)),
              toParseCase
            );
            writeToFile(
              config.prettierOptions,
              option.global.outFile,
              globalClassNameKeys
            );
          }
        } catch (e) {
          if (isSassException(e)) {
            if (e.name !== fileName) {
              console.error("e :>> ", e);
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("e :>> ", e);
  }
};

// src/index.ts
var { resolveConfig } = import_prettier2.default;
function Plugin(option = {}) {
  let cacheConfig;
  const enabledMode = option.enabledMode || ["development"];
  return {
    name: "vite-plugin-sass-dts",
    async configResolved(config) {
      const prettierOptions = await resolveConfig(config.root) || {};
      cacheConfig = {
        ...config,
        prettierOptions: { ...prettierOptions, filepath: "*.d.ts" }
      };
    },
    handleHotUpdate(context) {
      if (!isCSSModuleRequest(context.file))
        return;
      main(context.file, cacheConfig, option);
      return;
    },
    transform(code, id) {
      const fileName = id.replace(/(?:\?|&)(used|direct|inline|vue).*/, "");
      if (!enabledMode.includes(cacheConfig.env.MODE) || !isCSSModuleRequest(fileName)) {
        return void 0;
      }
      return new Promise(
        (resolve) => resolve(main(fileName, cacheConfig, option))
      );
    }
  };
}
