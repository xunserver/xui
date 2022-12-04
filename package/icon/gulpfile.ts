import { src, dest, series } from "gulp";
import File from "vinyl";
import fs from "fs";
import { pipe } from "@xunserver/util";
import { rm } from "@xunserver/shell";
import parseXML from "@rgrove/parse-xml";
import rename from "gulp-rename";

import { streamTransform } from "./plugin/streamTransform";
import { svgo } from "./plugin/svgo";
import { formateSvg } from "./plugin/svgFormat";
import { genIcon } from "./plugin/genIcon";
import { IconDef } from "./template/type";

const iconList: { svg: IconDef; file: File }[] = [];

export default series(
  () => src("template/*").pipe(dest("src")),
  () =>
    src("svg/*")
      .pipe(
        streamTransform((content, file) => {
          return pipe(
            svgo,
            parseXML,
            (svg: any) => {
              const svgObj = formateSvg(file)(svg);
              iconList.push({
                file: file,
                svg: svgObj,
              });
              return svgObj;
            },
            JSON.stringify,
            genIcon
          )(content);
        })
      )
      .pipe(
        rename((file) => {
          file.dirname = "";
          file.extname = ".ts";
        })
      )
      .pipe(dest("src/icon")),
  async () =>
    fs.writeFileSync(
      "./src/index.ts",
      iconList
        .map(
          (icon) =>
            `export { default as ${
              icon.svg.name
            } } from './icon/${icon.file.basename.replace(".svg", "")}';`
        )
        .join("\n") + `export * from './type'`
    )
);
