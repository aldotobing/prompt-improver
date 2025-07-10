import { TabsProps } from "./types";

export const Tabs = ({ tabs, activeTab, setActiveTab, theme = 'light' }: TabsProps) => {
  const getLabel = (label: string | ((count: number) => string), count: number) => {
    return typeof label === 'function' ? label(count) : label;
  };

  return (
    <div className="flex border-b border-gray-200 mb-4 px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600"
              : `text-gray-600 hover:text-blue-500 ${theme === 'dark' ? 'text-gray-400' : ''}`
          }`}
        >
          {getLabel(tab.label, tab.id === 'history' ? 0 : 0)}
        </button>
      ))}
    </div>
  );
};
