import {
  DropdownSelect,
  H6,
  Spinner,
  VisualizationWidget,
  VisualizationWidgetBody,
  VisualizationWidgetBodyContent,
  VisualizationWidgetBodySidebar,
  VisualizationWidgetHeader,
  VisualizationWidgetHeaderItem,
} from '@undp-data/undp-design-system-react';
import '@undp-data/undp-design-system-react/dist/style.css';
import {
  fetchAndParseCSV,
  SingleGraphDashboard,
} from '@undp-data/undp-visualization-library';
import {
  BarChart3Icon,
  ChevronDownCircle,
  ChevronRightCircle,
  LineChartIcon,
  MapIcon,
  TableIcon,
  UngroupIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Metadata {
  Indicator: string;
  DataKey: string;
}

interface OptionType {
  value: string | number;
  label: string;
}

interface AppProps {
  iso: string;
}

function App({ iso }: AppProps) {
  const [data, setData] = useState<any[] | null>(null);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('map');
  const [selectedIndicator, setSelectedIndicator] = useState<OptionType | null>(
    null,
  );
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // Load CSV Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const d = (await fetchAndParseCSV(`/data/${iso}.csv`)) as any[];
        setData(d);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [iso]);

  // Load Metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/data/meta.json`);
        const metadataJson = await response.json();
        setMetadata(metadataJson);

        // Set "Indicator 1" as default if available
        const defaultIndicator = metadataJson.find(
          (item: Metadata) => item.Indicator === 'Indicator 1',
        );
        if (defaultIndicator) {
          setSelectedIndicator({
            value: defaultIndicator.DataKey,
            label: defaultIndicator.Indicator,
          });
        }
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };
    loadMetadata();
  }, []);

  const indicatorOptions: OptionType[] = metadata.map(indicator => ({
    value: String(indicator.DataKey),
    label: indicator.Indicator,
  }));

  return (
    <div className='m-5'>
      <VisualizationWidget>
        <VisualizationWidgetHeader onChange={setSelectedTab} defaultValue='map'>
          <VisualizationWidgetHeaderItem value='map'>
            <MapIcon strokeWidth={1.25} />
            Map
          </VisualizationWidgetHeaderItem>
          <VisualizationWidgetHeaderItem value='ranks'>
            <BarChart3Icon strokeWidth={1.25} />
            Ranks
          </VisualizationWidgetHeaderItem>
          <VisualizationWidgetHeaderItem value='trends'>
            <LineChartIcon strokeWidth={1.25} />
            Trends
          </VisualizationWidgetHeaderItem>
          <VisualizationWidgetHeaderItem value='disaggregations'>
            <UngroupIcon strokeWidth={1.25} />
            Disaggregations
          </VisualizationWidgetHeaderItem>
          <VisualizationWidgetHeaderItem value='table'>
            <TableIcon strokeWidth={1.25} />
            Table View
          </VisualizationWidgetHeaderItem>
        </VisualizationWidgetHeader>
        <VisualizationWidgetBody>
          <VisualizationWidgetBodySidebar className='justify-start flex-col g-0'>
            <div>
              <button
                type='button'
                aria-label='Expand or collapse settings'
                className='flex gap-3 p-5 w-full items-center mb-0'
                onClick={() => setSettingsExpanded(!settingsExpanded)}
              >
                {settingsExpanded ? (
                  <ChevronDownCircle stroke='#212121' size={18} />
                ) : (
                  <ChevronRightCircle stroke='#212121' size={18} />
                )}
                <H6 className='md:mb-0'>Indicators</H6>
              </button>
              <div
                className='settings-sections-options-container'
                style={{ display: settingsExpanded ? 'flex' : 'none' }}
              >
                <DropdownSelect
                  placeholder='Select an indicator'
                  label='Indicator'
                  options={indicatorOptions}
                  value={selectedIndicator}
                  onChange={selected => {
                    if (!Array.isArray(selected)) {
                      setSelectedIndicator(selected);
                    }
                  }}
                  isSearchable
                />
              </div>
            </div>
          </VisualizationWidgetBodySidebar>
          <VisualizationWidgetBodyContent>
            {data ? (
              <div className='h-[2000px] bg-primary-gray-300 w-full'>
                {selectedTab === 'map' && <div>map</div>}
                {selectedTab === 'ranks' && selectedIndicator ? (
                  <SingleGraphDashboard
                    dataSettings={{ data }}
                    graphType='horizontalBarChart'
                    graphDataConfiguration={[
                      { columnId: 'Region name', chartConfigId: 'label' },
                      {
                        columnId: String(selectedIndicator.value),
                        chartConfigId: 'size',
                      },
                    ]}
                    graphSettings={{
                      graphTitle: selectedIndicator.label,
                      padding: '16px 32px 16px 16px',
                    }}
                  />
                ) : selectedTab === 'ranks' ? (
                  <p>Please select an indicator</p>
                ) : null}
                {selectedTab === 'trends' && <div>trends</div>}
                {selectedTab === 'disaggregations' && (
                  <div>disaggregations</div>
                )}
                {selectedTab === 'table' && <div>table</div>}
              </div>
            ) : (
              <div className='bg-primary-gray-300 w-full flex justify-center'>
                <Spinner size='large' />
              </div>
            )}
          </VisualizationWidgetBodyContent>
        </VisualizationWidgetBody>
      </VisualizationWidget>
    </div>
  );
}

export default App;
