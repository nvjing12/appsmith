import styled from "styled-components";
import type { CodeEditorBorder } from "components/editorComponents/CodeEditor/EditorConfig";
import {
  EditorSize,
  EditorTheme,
} from "components/editorComponents/CodeEditor/EditorConfig";
import type { Theme } from "constants/DefaultTheme";
import { Skin } from "constants/DefaultTheme";
import { Colors } from "constants/Colors";
import {
  NAVIGATION_CLASSNAME,
  PEEKABLE_CLASSNAME,
  PEEK_STYLE_PERSIST_CLASS,
} from "./MarkHelpers/entityMarker";

const getBorderStyle = (
  props: { theme: Theme } & {
    editorTheme?: EditorTheme;
    hasError: boolean;
    size: EditorSize;
    isFocused: boolean;
    disabled?: boolean;
  },
) => {
  if (props.hasError) return props.theme.colors.error;
  if (props.editorTheme !== EditorTheme.DARK) {
    if (props.isFocused) return props.theme.colors.inputActiveBorder;
    return props.theme.colors.border;
  }
  return "transparent";
};

const editorBackground = (theme?: EditorTheme) => {
  let bg = "#FAFAFA";
  switch (theme) {
    case EditorTheme.DARK:
      bg = "#1A191C";
      break;
    case EditorTheme.LIGHT:
      bg = "#FAFAFA";
      break;
  }
  return bg;
};

const codeMirrorColors = {
  KEYWORD: "#304eaa",
  FOLD_MARKER: "#442334",
  STRING: "#1659df",
  OPERATOR: "#009595",
  NUMBER: "#555",
  COMMENT: "#008000",
  FUNCTION_ARGS: "hsl(288, 44%, 44%)",
};

export const EditorWrapper = styled.div<{
  editorTheme?: EditorTheme;
  hasError: boolean;
  isFocused: boolean;
  disabled?: boolean;
  size: EditorSize;
  height?: string | number;
  borderLess?: boolean;
  isNotHover?: boolean;
  isReadOnly?: boolean;
  isRawView?: boolean;
  border?: CodeEditorBorder;
  hoverInteraction?: boolean;
  fillUp?: boolean;
  className?: string;
  codeEditorVisibleOverflow?: boolean;
  ctrlPressed: boolean;
}>`
  width: 100%;
  ${(props) =>
    (props.size === EditorSize.COMPACT ||
      props.size === EditorSize.COMPACT_RETAIN_FORMATTING) &&
    props.isFocused
      ? `
  z-index: 5;
  right: 0;
  left: 0;
  top: 0;
  `
      : `position: relative;`}
  min-height: 36px;
  height: ${(props) => props.height || "auto"};
  background-color: ${(props) => editorBackground(props.editorTheme)};
  background-color: ${(props) => props.disabled && "#eef2f5"};
  border-color: ${getBorderStyle};
  display: flex;
  flex: 1;
  flex-direction: row;
  text-transform: none;
  ${(props) =>
    props.hoverInteraction
      ? `
  &:hover {
    && {
      .cm-s-duotone-dark.CodeMirror {
        cursor: pointer;
        border-radius: 0px;
        background: ${
          !props.isNotHover
            ? Colors.SHARK2
            : props.isFocused
            ? Colors.NERO
            : Colors.BALTIC_SEA
        };
      }
      .cm-s-duotone-light.CodeMirror {
        cursor: pointer;
        border-radius: 0px;
        background: ${Colors.GREY_1};
      }
    }
  }`
      : null};
  && {
    .CodeMirror-cursor {
      border-right: none;
      border-left-width: 2px;
      border-left-color: ${(props) =>
        props.editorTheme === EditorTheme.DARK
          ? props.theme.colors.textOnDarkBG
          : props.theme.colors.textDefault} !important;
    }
    .cm-s-duotone-light.CodeMirror {
      border-radius: 0px;
      font-family: ${(props) => props.theme.fonts.code};
      font-size: 13px;
      border: 1px solid
        ${(props) => {
          switch (true) {
            case props.border === "none":
              return "transparent";
            case props.border === "bottom-side":
              return Colors.MERCURY;
            case props.hasError:
              return "red";
            case props.isFocused:
              return "var(--appsmith-input-focus-border-color)";
            default:
              return Colors.GREY_5;
          }
        }};
      ${(props) => props.border === "none" && "border: none"};
      background: ${(props) => props.theme.colors.apiPane.bg};
      color: ${Colors.CHARCOAL};
      & {
        span.cm-operator {
          color: ${codeMirrorColors.OPERATOR};
        }
      }
      .cm-property {
        color: hsl(21, 70%, 53%);
      }
      .cm-keyword {
        color: #304eaa;
      }

      .CodeMirror-foldgutter {
        width: 0.9em;
      }

      /* gutter arrow to collapse or expand code */
      .CodeMirror-guttermarker-subtle {
        color: #442334 !important;
        &:after {
          font-size: 14px;
          position: absolute;
          right: 4px;
        }
      }

      /* Text selection */
      div.CodeMirror-selected {
        background: #dbeafe !important;
      }
      .cm-string,
      .token.string {
        color: ${codeMirrorColors.STRING};
      }

      /* json response in the debugger */
      .cm-string.cm-property {
        color: hsl(21, 70%, 53%);
      }

      // /* +, =>, -, etc. operators */
      // span.cm-operator {
      //   color: #009595;
      // }A

      /* function arguments */
      .cm-def {
        color: #364252; /* This is gray-7 from our new shades of gray */
      }

      /* variable declarations */
      .cm-keyword + span + .cm-def {
        color: #364252;
      }

      /* function arguments */
      .cm-def,
      .cm-property + span + .cm-def,
      .cm-def + span + .cm-def {
        color: ${codeMirrorColors.FUNCTION_ARGS};
      }

      .cm-atom + span + .cm-property,
      .cm-variable-2 + span + .cm-property {
        color: #364252;
      }

      /* object keys, object methods */
      .cm-keyword + span + .cm-property,
      .cm-variable + span + .cm-property,
      .cm-property + span + .cm-property,
      .cm-number + span + .cm-property,
      .cm-string + span + .cm-property,
      .cm-operator + span + .cm-property {
        color: hsl(30, 77%, 40%);
      }

      span.cm-number {
        color: ${codeMirrorColors.NUMBER};
      }

      .cm-s-duotone-light span.cm-variable-2,
      .cm-s-duotone-light span.cm-variable-3 {
        color: #364252;
      }

      .cm-positive,
      .cm-string-2,
      .cm-type,
      .cm-url {
        color: #364252;
      }

      .binding-brackets,
      .CodeMirror-matchingbracket,
      .binding-highlight {
        font-weight: 400;
      }

      .navigable-entity-highlight:hover {
        background-color: #ededed !important;
        font-weight: 600;
      }

      .binding-brackets {
        // letter-spacing: -1.8px;
        color: hsl(222, 70%, 77%);
      }

      /* some sql fixes */
      .cm-m-sql.cm-keyword {
        font-weight: 400;
        text-transform: uppercase;
      }

      .CodeMirror-activeline-background {
        background-color: #ececec;
      }
    }
    .cm-s-duotone-light .CodeMirror-gutters {
      background: ${Colors.Gallery};
    }
    .cm-s-duotone-dark.CodeMirror {
      border-radius: 0px;
      ${(props) =>
        props.border === "none"
          ? `border: 0px`
          : props.border === "bottom-side"
          ? `border-bottom: 1px solid ${Colors.NERO}`
          : `border: 1px solid ${Colors.NERO}`};
      background: ${(props) =>
        props.isFocused || props.fillUp ? Colors.NERO : "#262626"};
      color: ${Colors.LIGHT_GREY};
    }
    .cm-s-duotone-light .CodeMirror-linenumber,
    .cm-s-duotone-dark .CodeMirror-linenumber {
      color: ${Colors.DOVE_GRAY};
    }
    .cm-s-duotone-dark .CodeMirror-gutters {
      background: ${Colors.SHARK2};
    }
    .binding-brackets {
      color: ${(props) =>
        props.editorTheme === EditorTheme.DARK
          ? props.theme.colors.bindingTextDark
          : props.theme.colors.bindingText};
      font-weight: 700;
    }

    .${PEEKABLE_CLASSNAME}:hover, .${PEEK_STYLE_PERSIST_CLASS} {
      background-color: #ededed;
    }

    .${NAVIGATION_CLASSNAME} {
      cursor: ${(props) => (props.ctrlPressed ? "pointer" : "selection")};
      ${(props) =>
        props.ctrlPressed &&
        `&:hover {
        text-decoration: underline;
        background-color:	#ededed;
      }`}
    }

    .CodeMirror-matchingbracket {
      text-decoration: none;
      color: #ffd600 !important;
      background-color: #a74444;
    }
    .datasource-highlight {
      background: ${(props) =>
        props.editorTheme === EditorTheme.DARK ? "#002B54" : "#e7f3ff"};
      border: 1px solid
        ${(props) =>
          props.editorTheme === EditorTheme.DARK ? "#10569A" : "#69b5ff"};
      padding: 2px;
      border-radius: 2px;
      margin-right: 2px;
    }
    .datasource-highlight-error {
      background: #fff0f0;
      border: 1px solid #f22b2b;
    }
    .datasource-highlight-success {
      background: #e3fff3;
      border: 1px solid #03b365;
    }
    .CodeMirror {
      flex: 1;
      line-height: 21px;
      z-index: 0;
      border-radius: 4px;
      height: auto;
    }
    ${(props) =>
      props.disabled &&
      `
    .CodeMirror-cursor {
      display: none !important;
    }
    `}
    .CodeMirror pre.CodeMirror-placeholder {
      color: ${(props) =>
        props.theme.colors.apiPane.codeEditor.placeholderColor};
    }
    ${(props) =>
      (props.size === EditorSize.COMPACT ||
        props.size === EditorSize.COMPACT_RETAIN_FORMATTING) &&
      `
      .CodeMirror-hscrollbar {
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    `}
  }
  && {
    .CodeMirror-lines {
      padding: ${(props) => props.theme.spaces[2]}px 0px;
      background-color: ${(props) => props.disabled && "#eef2f5"};
      cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};
    }
  }
  ${(props) =>
    props.className === "js-editor" &&
    `
    overflow: hidden;
    .cm-tab {
      border-right: 1px dotted #ccc;
    }
    height: 100%;
  `}

  .bp3-popover-target {
    padding-right: 10px;
    padding-top: 5px;
  }
  .leftImageStyles {
    width: 20px;
    height: 20px;
    margin: 5px;
  }
  .linkStyles {
    margin: 5px;
    margin-right: 11px;
  }
  .CodeMirror-foldmarker {
    color: inherit;
    text-shadow: none;
    font: inherit;
  }
  .CodeEditorTarget {
    width: 100%;

    &:focus {
      border: 1px solid var(--appsmith-input-focus-border-color);
      .CodeMirror.cm-s-duotone-light {
        border: none;
      }
    }

    ${(props) =>
      props.size === EditorSize.COMPACT ||
      props.size === EditorSize.COMPACT_RETAIN_FORMATTING
        ? `
        position: absolute;
        left: 0;
        right: 0;
      `
        : `
          position: relative;
        `}
    ${(props) => (props.isFocused ? `z-index: 3;` : `z-index: 0;`)}

    ${(props) => {
      let height = props.height || "auto";
      if (
        (props.size === EditorSize.COMPACT ||
          props.size === EditorSize.COMPACT_RETAIN_FORMATTING) &&
        !props.isFocused
      ) {
        height = props.height || "36px";
      }
      return `height: ${height}`;
    }}
  }

  ${(props) =>
    props.codeEditorVisibleOverflow &&
    `
    &&&&&&&& .CodeMirror-scroll {
      overflow: visible;
    }

    & .CodeEditorTarget {
      height: ${props.isFocused ? "auto" : "35px"};
    }
  `}

  ${(props) =>
    props.isReadOnly &&
    `
      &&&&&&&&&& .cm-m-javascript.cm-number {
        color: ${props.isRawView ? "#000" : "#268bd2"};

      }
      &&&&&&&& .cm-m-javascript.cm-string.cm-property {
        color: ${props.isRawView ? "#000" : "#002b36"};
      }

      &&&&&&&& .cm-m-javascript.cm-string {
        color: ${props.isRawView ? "#000" : "#cb4b16"};
      }
    `}
`;

export const IconContainer = styled.div`
  border-radius: 4px 0 0 4px;
  margin: 0;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eef2f5;
  svg {
    height: 20px;
    width: 20px;
    path {
      fill: #979797;
    }
  }
`;

export const DynamicAutocompleteInputWrapper = styled.div<{
  skin: Skin;
  theme: Theme;
  isActive: boolean;
  isNotHover: boolean;
  isError: boolean;
}>`
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
  > span:first-of-type {
    width: 30px;
    position: absolute;
    right: 0px;
  }
  &:hover {
    .lightning-menu {
      background: ${(props) => (!props.isNotHover ? "#090707" : "")};
      svg {
        path,
        circle {
          fill: ${(props) =>
            !props.isNotHover
              ? props.skin === Skin.DARK
                ? Colors.BLUE_CHARCOAL
                : Colors.ALTO2
              : ""};
        }
      }
    }
    .commands-button {
      display: flex;
    }
  }
  border-radius: 0px;
  .lightning-menu {
    z-index: 1 !important;
  }
  .commands-button {
    z-index: 2;
    width: 20px;
    position: absolute;
    right: 0;
    transform: translate(-50%, 50%);
    height: 20px;
    background: transparent;
    display: none;
    color: #f86a2b;
    border: none;
    font-weight: bold;
    font-size: 14px;
    font-style: italic;
    padding: 0 0 3px;
    margin: 0 !important;
    top: -2px;
    &:hover {
      background: #f86a2b;
      color: white;
    }
  }
`;
