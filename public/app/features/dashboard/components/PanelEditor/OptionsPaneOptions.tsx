import React, { ReactElement, useState } from 'react';
import { FieldConfigSource, GrafanaTheme, PanelPlugin } from '@grafana/data';
import { DashboardModel, PanelModel } from '../../state';
import { CustomScrollbar, Field, RadioButtonGroup, useStyles } from '@grafana/ui';
import { usePanelLatestData } from './usePanelLatestData';
import { OptionPaneRenderProps } from './types';
import { getPanelFrameOptions } from './getPanelFrameOptions';
import { getVizualizationOptions } from './getVizualizationOptions';
import { css } from 'emotion';
import { FilterInput } from 'app/core/components/FilterInput/FilterInput';
import { OptionsPaneItem, OptionsPaneItemProps } from './OptionsPaneItem';
import { OptionsPaneCategory, OptionsPaneCategoryProps } from './OptionsPaneCategory';
import { getFieldOverrideElements } from './getFieldOverrideElements';

interface Props {
  plugin: PanelPlugin;
  panel: PanelModel;
  dashboard: DashboardModel;
  onFieldConfigsChange: (config: FieldConfigSource) => void;
  onPanelOptionsChanged: (options: any) => void;
  onPanelConfigChange: (configKey: string, value: any) => void;
}

export const OptionsPaneOptions: React.FC<Props> = ({
  plugin,
  panel,
  onFieldConfigsChange,
  onPanelOptionsChanged,
  onPanelConfigChange,
  dashboard,
}: Props) => {
  const { data } = usePanelLatestData(panel, { withTransforms: true, withFieldConfig: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [listMode, setListMode] = useState('all');
  const searchRegex = new RegExp(searchQuery, 'i');
  const styles = useStyles(getStyles);

  const optionProps: OptionPaneRenderProps = {
    panel,
    onPanelOptionsChanged,
    onPanelConfigChange,
    onFieldConfigsChange,
    plugin,
    data,
    eventBus: dashboard.events,
  };

  const allDefaults = [getPanelFrameOptions(optionProps), ...getVizualizationOptions(optionProps)];

  const justOverrides = getFieldOverrideElements(optionProps);
  const allOptions = allDefaults.concat(justOverrides);

  const radioOptions = [
    { label: 'All', value: 'all' },
    { label: 'Popular', value: 'popular' },
    { label: `Overrides`, value: 'overrides' },
  ];

  const isSearching = searchQuery.length > 0;
  const showAllDefaults = !isSearching && listMode === 'all';
  const showOverridesInSeparateBox = !isSearching && listMode === 'all';
  const showOnlyOverrides = !isSearching && listMode === 'overrides';
  const showPopular = listMode === 'popular';

  return (
    <div className={styles.wrapper}>
      <div className={styles.formBox}>
        <Field className={styles.customFieldMargin}>
          <FilterInput width={0} value={searchQuery} onChange={setSearchQuery} placeholder={'Search options'} />
        </Field>
        <Field className={styles.noFieldMargin}>
          <RadioButtonGroup options={radioOptions} value={listMode} fullWidth onChange={setListMode} />
        </Field>
      </div>
      <CustomScrollbar autoHeightMin="100%">
        <div className={styles.mainBox}>
          {showAllDefaults && allDefaults}
          {showOnlyOverrides && justOverrides}
          {showPopular && (
            <OptionsPaneCategory id="Popular options" title="Popular options">
              No poular options, try again later
            </OptionsPaneCategory>
          )}
          {isSearching && (
            <OptionsPaneCategory id="Found options" title="Found options">
              {getSearchHits(allOptions, searchRegex)}
            </OptionsPaneCategory>
          )}
        </div>

        {showOverridesInSeparateBox && <div className={styles.overridesBox}>{justOverrides}</div>}
      </CustomScrollbar>
    </div>
  );
};

function getSearchHits(items: Array<ReactElement<OptionsPaneCategoryProps>>, searchRegex: RegExp) {
  const filteredItems: React.ReactElement[] = [];

  React.Children.forEach(items, (topGroup) => {
    React.Children.forEach(topGroup, (item) => {
      const displayName = (item.type as any).displayName;

      if (displayName === OptionsPaneItem.displayName) {
        const props = item.props as OptionsPaneItemProps;
        if (searchRegex.test(props.title)) {
          filteredItems.push(item);
        }
        return;
      }

      if (item.props.children) {
        filteredItems.push(...getSearchHits(item.props.children as any, searchRegex));
      }
    });
  });

  return filteredItems;
}

const getStyles = (theme: GrafanaTheme) => ({
  searchBox: css`
    display: flex;
    flex-direction: column;
    min-height: 0;
  `,
  customFieldMargin: css`
    margin-bottom: ${theme.spacing.sm};
  `,
  noFieldMargin: css`
    margin-bottom: 0;
  `,
  formBox: css`
    padding: ${theme.spacing.sm};
    background: ${theme.colors.bg1};
    border: 1px solid ${theme.colors.border1};
    border-bottom: 0;
  `,
  searchHits: css`
    padding: ${theme.spacing.sm} ${theme.spacing.sm} 0 ${theme.spacing.sm};
  `,
  wrapper: css`
    flex-grow: 1;
    min-height: 0;
  `,
  mainBox: css`
    background: ${theme.colors.bg1};
    border: 1px solid ${theme.colors.border1};
    border-top: none;
    margin-bottom: ${theme.spacing.md};
  `,
  overridesBox: css`
    background: ${theme.colors.bg1};
    border: 1px solid ${theme.colors.border1};
    margin-bottom: ${theme.spacing.md};
  `,
});
