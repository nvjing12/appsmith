import React from "react";
import { get, isString } from "lodash";
import styled from "styled-components";
import type { ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import { ControlWrapper, StyledPropertyPaneButton } from "./StyledControls";
import { FormIcons } from "icons/FormIcons";
import type { CodeEditorExpected } from "components/editorComponents/CodeEditor";
import type { EditorTheme } from "components/editorComponents/CodeEditor/EditorConfig";
import {
  EditorModes,
  EditorSize,
  TabBehaviour,
} from "components/editorComponents/CodeEditor/EditorConfig";
import { Size, Category } from "design-system-old";
import type { AllChartData, ChartData } from "widgets/ChartWidget/constants";
import { generateReactKey } from "utils/generators";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import LazyCodeEditor from "components/editorComponents/LazyCodeEditor";
import ColorPickerComponent from "./ColorPickerComponentV2";

const Wrapper = styled.div`
  background-color: ${(props) =>
    props.theme.colors.propertyPane.dropdownSelectBg};
  padding: 0 8px;
`;

const StyledOptionControlWrapper = styled(ControlWrapper)`
  display: flex;
  justify-content: flex-start;
  padding: 0;
  width: 100%;
`;

const StyledDynamicInput = styled.div`
  width: 100%;
  &&& {
    input {
      border: none;
      color: ${(props) => props.theme.colors.textOnDarkBG};
      background: ${(props) => props.theme.colors.paneInputBG};
      &:focus {
        border: none;
        color: ${(props) => props.theme.colors.textOnDarkBG};
        background: ${(props) => props.theme.colors.paneInputBG};
      }
    }
  }
`;

const StyledDeleteIcon = styled(FormIcons.DELETE_ICON)`
  padding: 0;
  position: relative;
  margin-left: 15px;
  cursor: pointer;

  &&& svg {
    path {
      fill: ${(props) => props.theme.colors.propertyPane.jsIconBg};
    }
  }
`;

const ActionHolder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledLabel = styled.label`
  margin: 8px auto 8px 0;

  && {
    color: ${(props) => props.theme.colors.propertyPane.label};
  }
`;

const Box = styled.div`
  height: 16px;
`;

type RenderComponentProps = {
  index: string;
  item: ChartData;
  length: number;
  dataTreePath: string;
  deleteOption: (index: string) => void;
  updateOption: (index: string, key: string, value: string) => void;
  evaluated: {
    seriesName: string;
    data: Array<{ x: string; y: string }> | any;
    color: string;
  };
  theme: EditorTheme;
  isPieChart?: boolean;
};

const expectedSeriesName: CodeEditorExpected = {
  type: "string",
  example: "series1",
  autocompleteDataType: AutocompleteDataType.STRING,
};
const expectedSeriesData: CodeEditorExpected = {
  type: "Array<{ x: string, y: number Required }>",
  example: [
    {
      x: "Mon",
      y: 10000,
    },
  ],
  autocompleteDataType: AutocompleteDataType.ARRAY,
};

function DataControlComponent(props: RenderComponentProps) {
  const {
    dataTreePath,
    deleteOption,
    evaluated,
    index,
    isPieChart,
    item,
    length,
    updateOption,
  } = props;

  return (
    <StyledOptionControlWrapper orientation={"VERTICAL"}>
      <ActionHolder>
        <StyledLabel>Series Title</StyledLabel>
        {length > 1 && (
          <StyledDeleteIcon
            height={20}
            onClick={() => {
              deleteOption(index);
            }}
            width={20}
          />
        )}
      </ActionHolder>
      <StyledOptionControlWrapper orientation={"HORIZONTAL"}>
        <LazyCodeEditor
          dataTreePath={`${dataTreePath}.seriesName`}
          evaluatedValue={evaluated?.seriesName}
          expected={expectedSeriesName}
          input={{
            value: item.seriesName,
            onChange: (
              event: React.ChangeEvent<HTMLTextAreaElement> | string,
            ) => {
              let value: string = event as string;
              if (typeof event !== "string") {
                value = event.target.value;
              }
              updateOption(index, "seriesName", value);
            },
          }}
          mode={EditorModes.TEXT_WITH_BINDING}
          placeholder="Series Name"
          size={EditorSize.EXTENDED}
          tabBehaviour={TabBehaviour.INPUT}
          theme={props.theme}
        />
      </StyledOptionControlWrapper>
      {!isPieChart && (
        <>
          <StyledLabel>Series Color</StyledLabel>
          <StyledOptionControlWrapper orientation={"HORIZONTAL"}>
            <ColorPickerComponent
              changeColor={(
                event: React.ChangeEvent<HTMLTextAreaElement> | string,
              ) => {
                let value: string = event as string;
                if (typeof event !== "string") {
                  value = event.target.value;
                }
                updateOption(index, "color", value);
              }}
              color={item.color || ""}
              placeholderText="enter color hexcode"
              showApplicationColors
            />
          </StyledOptionControlWrapper>
        </>
      )}
      <StyledLabel>Series Data</StyledLabel>
      <StyledDynamicInput
        className={"t--property-control-chart-series-data-control"}
      >
        <LazyCodeEditor
          dataTreePath={`${dataTreePath}.data`}
          evaluatedValue={evaluated?.data}
          expected={expectedSeriesData}
          input={{
            value: item.data,
            onChange: (
              event: React.ChangeEvent<HTMLTextAreaElement> | string,
            ) => {
              let value: string = event as string;
              if (typeof event !== "string") {
                value = event.target.value;
              }
              updateOption(index, "data", value);
            },
          }}
          mode={EditorModes.JSON_WITH_BINDING}
          placeholder=""
          size={EditorSize.EXTENDED}
          tabBehaviour={TabBehaviour.INPUT}
          theme={props.theme}
        />
      </StyledDynamicInput>
      <Box />
    </StyledOptionControlWrapper>
  );
}

class ChartDataControl extends BaseControl<ControlProps> {
  render() {
    const chartData: AllChartData = isString(this.props.propertyValue)
      ? {}
      : this.props.propertyValue;

    const dataLength = Object.keys(chartData).length;

    const evaluatedValue = this.props.evaluatedValue;
    const firstKey = Object.keys(chartData)[0] as string;

    if (this.props.widgetProperties.chartType === "PIE_CHART") {
      const data = dataLength
        ? get(chartData, `${firstKey}`)
        : {
            seriesName: "",
            data: [],
          };

      return (
        <DataControlComponent
          dataTreePath={`${this.props.dataTreePath}.${firstKey}`}
          deleteOption={this.deleteOption}
          evaluated={get(evaluatedValue, `${firstKey}`)}
          index={firstKey}
          isPieChart
          item={data}
          length={1}
          theme={this.props.theme}
          updateOption={this.updateOption}
        />
      );
    }

    return (
      <>
        <Wrapper>
          {Object.keys(chartData).map((key: string) => {
            const data = get(chartData, `${key}`);

            return (
              <DataControlComponent
                dataTreePath={`${this.props.dataTreePath}.${key}`}
                deleteOption={this.deleteOption}
                evaluated={get(evaluatedValue, `${key}`)}
                index={key}
                item={data}
                key={key}
                length={dataLength}
                theme={this.props.theme}
                updateOption={this.updateOption}
              />
            );
          })}
        </Wrapper>

        <StyledPropertyPaneButton
          category={Category.secondary}
          icon="plus"
          onClick={this.addOption}
          size={Size.medium}
          tag="button"
          text="Add Series"
          type="button"
        />
      </>
    );
  }

  deleteOption = (index: string) => {
    this.deleteProperties([`${this.props.propertyName}.${index}`]);
  };

  updateOption = (
    index: string,
    propertyName: string,
    updatedValue: string,
  ) => {
    this.updateProperty(
      `${this.props.propertyName}.${index}.${propertyName}`,
      updatedValue,
    );
  };

  /**
   * it adds new series data object in the chartData
   */
  addOption = () => {
    const randomString = generateReactKey();

    this.updateProperty(`${this.props.propertyName}.${randomString}`, {
      seriesName: "",
      data: JSON.stringify([{ x: "label", y: 50 }]),
    });
  };

  static getControlType() {
    return "CHART_DATA";
  }
}

export default ChartDataControl;
