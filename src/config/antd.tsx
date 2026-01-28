import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';

// Ant Design theme configuration matching our design system
const antdTheme = {
  token: {
    // Primary colors - Deep Navy Blue
    colorPrimary: '#1e3a5f',
    colorPrimaryHover: '#2a4a73',
    colorPrimaryActive: '#152a45',
    
    // Success - Teal accent
    colorSuccess: '#2d9676',
    colorSuccessBg: 'rgba(45, 150, 118, 0.1)',
    
    // Warning
    colorWarning: '#f59e0b',
    colorWarningBg: 'rgba(245, 158, 11, 0.1)',
    
    // Error/Destructive
    colorError: '#ef4444',
    colorErrorBg: 'rgba(239, 68, 68, 0.1)',
    
    // Info
    colorInfo: '#1e3a5f',
    
    // Border and backgrounds
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgElevated: '#ffffff',
    
    // Text colors
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',
    
    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Typography
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // Spacing
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    
    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingMD: 20,
    paddingLG: 24,
    paddingXL: 32,
    
    // Box shadow
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    
    // Control height
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 20,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#475569',
    },
    Modal: {
      borderRadius: 16,
    },
    Drawer: {
      borderRadius: 0,
    },
    Menu: {
      itemBorderRadius: 8,
      subMenuItemBorderRadius: 8,
    },
    Tag: {
      borderRadius: 6,
    },
    Badge: {
      dotSize: 8,
    },
    Tabs: {
      inkBarColor: '#2d9676',
      itemActiveColor: '#1e3a5f',
      itemHoverColor: '#2a4a73',
      itemSelectedColor: '#1e3a5f',
    },
    Progress: {
      defaultColor: '#2d9676',
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28,
    },
  },
};

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
}

export { antdTheme };
