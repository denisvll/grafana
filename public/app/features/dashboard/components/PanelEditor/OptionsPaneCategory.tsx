import React, { FC, ReactNode, useCallback, useState } from 'react';
import { css, cx } from 'emotion';
import _ from 'lodash';
import { GrafanaTheme } from '@grafana/data';
import { Icon, stylesFactory, useTheme } from '@grafana/ui';
import { PANEL_EDITOR_UI_STATE_STORAGE_KEY } from './state/reducers';
import { useLocalStorage } from 'react-use';
import { selectors } from '@grafana/e2e-selectors';

export interface OptionsPaneCategoryProps {
  id: string;
  title?: React.ReactNode;
  renderTitle?: (isExpanded: boolean) => React.ReactNode;
  defaultToClosed?: boolean;
  className?: string;
  nested?: boolean;
  children: ReactNode;
}

export const OptionsPaneCategory: FC<OptionsPaneCategoryProps> = React.memo(
  ({ id, title, children, defaultToClosed, renderTitle, className, nested = false }) => {
    const [savedState, setSavedState] = useLocalStorage(getOptionGroupStorageKey(id), { isExpanded: !defaultToClosed });
    const [isExpanded, setExpanded] = useState(savedState.isExpanded);
    const theme = useTheme();
    const styles = getStyles(theme, isExpanded, nested);

    const onToggle = useCallback(() => {
      setSavedState({ isExpanded: !isExpanded });
      setExpanded(!isExpanded);
    }, [setSavedState, isExpanded, setExpanded]);

    return (
      <div className={cx(styles.box, className, 'options-group')}>
        <div className={styles.header} onClick={onToggle} aria-label={selectors.components.OptionsGroup.toggle(id)}>
          <div className={cx(styles.toggle, 'editor-options-group-toggle')}>
            <Icon name={isExpanded ? 'angle-down' : 'angle-right'} />
          </div>
          <div className={styles.title}>{renderTitle ? renderTitle(isExpanded) : title}</div>
        </div>
        {isExpanded && <div className={styles.body}>{children}</div>}
      </div>
    );
  }
);

const getStyles = stylesFactory((theme: GrafanaTheme, isExpanded: boolean, isNested: boolean) => {
  return {
    box: cx(
      !isNested &&
        css`
          border-bottom: 1px solid ${theme.colors.pageHeaderBorder};
          &:last-child {
            border-bottom: none;
          }
        `,
      isNested &&
        isExpanded &&
        css`
          margin-bottom: ${theme.spacing.formSpacingBase * 2}px;
        `
    ),
    toggle: css`
      color: ${theme.colors.textWeak};
      margin-right: ${theme.spacing.sm};
    `,
    title: css`
      flex-grow: 1;
      overflow: hidden;
    `,
    header: cx(
      css`
        display: flex;
        cursor: pointer;
        align-items: baseline;
        padding: ${theme.spacing.sm};
        color: ${isExpanded ? theme.colors.text : theme.colors.formLabel};
        font-weight: ${theme.typography.weight.semibold};

        &:hover {
          color: ${theme.colors.text};

          .editor-options-group-toggle {
            color: ${theme.colors.text};
          }
        }
      `,
      isNested &&
        css`
          padding-left: 0;
          padding-right: 0;
          padding-top: 0;
        `
    ),
    body: cx(
      css`
        padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.xl};
      `,
      isNested &&
        css`
          position: relative;
          padding-right: 0;
          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: 8px;
            width: 1px;
            height: 100%;
            background: ${theme.colors.pageHeaderBorder};
          }
        `
    ),
  };
});

const getOptionGroupStorageKey = (id: string): string => `${PANEL_EDITOR_UI_STATE_STORAGE_KEY}.optionGroup[${id}]`;