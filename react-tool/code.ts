// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 600 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "generate") {
    let str = "";
    const localCollections = figma.variables.getLocalVariableCollections();

    for (const node of figma.currentPage.selection) {
      str += getChildrenView(node, str, localCollections, null, true);
    }

    figma.ui.postMessage(str);
  } else if (msg.type === "generateTextEN" || msg.type === "generateTextTODO") {
    const isEn = msg.type === "generateTextEN";
    let str = "";
    for (const node of figma.currentPage.selection) {
      if (node.type === "TEXT") {
        str += getText(node, str, isEn);
      }
    }

    figma.ui.postMessage(str);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

const getChildrenView = (
  node: SceneNode,
  acc: string,
  localCollections: Array<VariableCollection>,
  parentLayout: {
    layout: InferredAutoLayoutResult | null;
    itemSpacingId: string | undefined;
  } | null,
  firstElement: boolean
): string => {
  const marginStyle = firstElement
    ? undefined
    : parentLayout?.layout !== null && parentLayout?.layout !== undefined
    ? parentLayout.layout.layoutMode === "HORIZONTAL"
      ? `marginLeft:${findSpacingSize(parentLayout.itemSpacingId)},`
      : parentLayout.layout.layoutMode === "VERTICAL"
      ? `marginTop:${findSpacingSize(parentLayout.itemSpacingId)},`
      : undefined
    : undefined;

  if (node.type === "FRAME" && "children" in node) {
    const containerStyle =
      parentLayout?.layout?.layoutMode === "HORIZONTAL"
        ? `flexDirection: "row",${
            parentLayout.layout.primaryAxisAlignItems === "SPACE_BETWEEN"
              ? `justifyContent: "space-between"`
              : ""
          }, alignItems: "center",`
        : undefined;

    const firstChild = node.children[0];
    const firstElementIsCard =
      hasCardTitleWord(firstChild.name) && firstChild.type === "INSTANCE";

    const content = node.children.reduce(
      (_acc, v, idx) =>
        firstElementIsCard && idx === 0
          ? _acc
          : getChildrenView(
              v,
              _acc,
              localCollections,
              idx === 1 && firstElementIsCard
                ? null
                : {
                    layout: node.inferredAutoLayout,
                    itemSpacingId: node.boundVariables?.itemSpacing?.id,
                  },
              idx === 0
            ),
      ""
    );

    const el =
      marginStyle === undefined && containerStyle === undefined
        ? firstElement
          ? `<View>${content}</View>`
          : content
        : `<View style={{${containerStyle ?? ""} ${
            marginStyle ?? ""
          }}}>${content}</View>`;

    return firstElementIsCard
      ? acc +
          `<Card theme={appCtx.theme} title={{text:translations[appCtx.userLocale.userLanguage].${toLowercaseFirstLetterCamelCase(
            firstChild.componentProperties?.["Text#3945:0"]?.value.toString() ??
              ""
          )}, showIconRight:${
            firstChild.componentProperties?.["isLink"]?.value
          }}}>${content}</Card>`
      : acc + el;
  } else {
    let content = "";
    if (node.type === "TEXT") {
      content = getTextKind(node) ?? "";
    } else if (node.type === "INSTANCE" || node.type === "COMPONENT") {
      if (hasIconWord(node.name)) {
        content = `<Icon color={textColors[appCtx.theme].default} icon="${replaceIconWord(
          node.name
        )}" size={${getIconSize(node)}}/>`;
      } else if (node.name.includes("Button")) {
        const buttonKind = node.variantProperties?.["Type"] ?? "";

        const text = node
          .findChildren((n) => n.type === "TEXT")
          .reduce(
            (acc, v) => (v.type === "TEXT" ? acc + v.characters : acc),
            ""
          );

        content = `<${node.name} theme={appCtx.theme} ${
          buttonKind === undefined ? "" : `kind="${buttonKind}"`
        } text={${
          text !== undefined && text !== ""
            ? `translations[appCtx.userLocale.userLanguage].${toLowercaseFirstLetterCamelCase(
                text
              )}`
            : ""
        }}/>`;
      } else {
        console.log("component", node.name);

        const nodeName = node.name;
        content = `<${
          nodeName.charAt(0).toUpperCase() + nodeName.slice(1)
        } theme={appCtx.theme} />`;
      }
    } else {
      console.log("others", node.name, node.type);
      content = `<>${node.name}, ${node.type}</>`;
    }

    const el =
      marginStyle === undefined
        ? content
        : `<View style={{${marginStyle ?? ""}}}>${content}</View>`;

    return acc + el;
  }
};

const getTextKind = (node: TextNode): string | undefined => {
  const styleId = node.textStyleId;

  const textKind = figma.getStyleById(`${styleId as string}`)?.name;
  const nodeColorIds = node.boundVariables?.fills;

  const colorName =
    nodeColorIds !== undefined && nodeColorIds.length > 0
      ? figma.variables.getVariableById(nodeColorIds[0].id)?.name ?? undefined
      : undefined;

  if (textKind === undefined) {
    console.warn("textKind===undefined");
    return "<P kind={undefined} />";
  } else if (colorName === undefined) {
    console.warn("colorName===undefined");
    return "<P color={undefined} />";
  } else {
    const text = textKind.replace("/", "");
    const color = colorName.split("/");

    const translation = `translations[appCtx.userLocale.userLanguage].${toLowercaseFirstLetterCamelCase(
      node.characters
    )}`;

    if (text.includes("Heading")) {
      const heading = toCapitalFirstLetterCamelCase(
        text.replace("Heading", "")
      );
      return `<${heading}  color={${color[0]}[appCtx.theme].${color[1]}}>{${translation}}</${heading}>`;
    } else {
      const kind =
        text === "BodyMedium"
          ? undefined
          : text.charAt(0).toLowerCase() + text.slice(1);
      return `<P ${kind === undefined ? "" : `kind="${kind}"`} color={${
        color[0]
      }[appCtx.theme].${color[1]}}>{${translation}}</P>`;
    }
  }
};

const toCapitalFirstLetterCamelCase = (text: string): string => {
  const words = text
    .replace(/^[\d:]+/, "") // replace numbers and special symbols
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ");

  const camelCaseWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  const camelCaseText = camelCaseWords.join("");

  return camelCaseText;
};
const toLowercaseFirstLetterCamelCase = (text: string): string => {
  const words = text
    .replace(/^[\d:]+/, "") // replace numbers and special symbols
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ");

  const camelCaseWords = words.map((word, idx) =>
    idx === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  const camelCaseText = camelCaseWords.join("").slice(0, 18);

  return camelCaseText;
};

const hasIconWord = (text: string): boolean => {
  const regex = /\bicon\b/i;
  return regex.test(text);
};
const hasCardTitleWord = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return lowercaseText.includes("card title");
};
const replaceIconWord = (text: string): string => {
  const regex = /icon\//gi;
  return text.replace(regex, "");
};
const getIconSize = (node: SceneNode): string => {
  const nodeWidthId = node.boundVariables?.width?.id;

  const size =
    nodeWidthId !== undefined
      ? figma.variables.getVariableById(nodeWidthId)?.name
      : undefined;

  return `fontSize[${size}]`;
};

const getText = (node: TextNode, str: string, isEn: boolean): string => {
  const content = node.characters;

  const text = `${toLowercaseFirstLetterCamelCase(content)}: "${
    isEn ? content : "TODO translate"
  }",`;

  return str + text;
};

const findSpacingSize = (spacingId: string | undefined): string => {
  const spacing =
    spacingId !== undefined
      ? figma.variables.getVariableById(spacingId)
      : undefined;

  return `spacing.${spacing?.name.split("/")[1]}`;
};
