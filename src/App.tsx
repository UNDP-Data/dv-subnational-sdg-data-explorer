import {
  DropdownSelect,
  H6,
  SegmentedControl,
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
  IndicatorDescription: string;
  Indicator: string;
  DataKey: string;
}

interface OptionType {
  value: string | number;
  label: string;
  description: string;
}

interface AppProps {
  iso3: string;
}

function App({ iso3 }: AppProps) {
  const [data, setData] = useState<any[] | null>(null);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  // const [geoadata, setGeodata] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('map');
  const [layoutOrientation, setLayoutOrientation] =
    useState<string>('horizontal');
  const [selectedIndicator, setSelectedIndicator] = useState<OptionType | null>(
    null,
  );
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const d = (await fetchAndParseCSV(`/data/${iso3}.csv`)) as any[];
        setData(d);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [iso3]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/data/meta.json`);
        const metadataJson = await response.json();
        setMetadata(metadataJson);

        const defaultIndicator = metadataJson.find(
          (item: Metadata) => item.Indicator === 'Indicator 1',
        );
        if (defaultIndicator) {
          setSelectedIndicator({
            value: defaultIndicator.DataKey,
            label: defaultIndicator.Indicator,
            description: defaultIndicator.IndicatorDescription,
          });
        }
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };
    loadMetadata();
  }, []);

  // useEffect(() => {
  //   const loadGeodata = async () => {
  //     try {
  //       const response = await fetch(
  //         `https://raw.githubusercontent.com/UNDP-Data/dv-country-geojson/refs/heads/main/ADM1/${iso3}.json`,
  //       );
  //       const geoDataJson = await response.json();
  //       setGeodata(geoDataJson);
  //     } catch (error) {
  //       console.error('Error loading geodata:', error);
  //     }
  //   };
  //   loadGeodata();
  // }, []);

  const indicatorOptions: OptionType[] = metadata.map(indicator => ({
    value: String(indicator.DataKey),
    label: indicator.Indicator,
    description: indicator.IndicatorDescription,
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
            <div className='border-b py-5 pt-0'>
              <DropdownSelect
                placeholder='Select an indicator'
                label='Select indicator'
                options={indicatorOptions}
                value={selectedIndicator}
                onChange={selected => {
                  if (!Array.isArray(selected)) {
                    const selectedOption = indicatorOptions.find(
                      option => selected && option.value === selected.value,
                    );
                    if (selectedOption) {
                      setSelectedIndicator(selectedOption);
                    }
                  }
                }}
                isSearchable
              />
            </div>
            <div>
              <button
                type='button'
                aria-label='Expand or collapse settings'
                className='flex gap-3 py-5 w-full items-center mb-0'
                onClick={() => setSettingsExpanded(!settingsExpanded)}
              >
                {settingsExpanded ? (
                  <ChevronDownCircle stroke='#212121' size={18} />
                ) : (
                  <ChevronRightCircle stroke='#212121' size={18} />
                )}
                <H6 className='md:mb-0 text-sm font-semibold'>Settings</H6>
              </button>
              <div
                className='settings-sections-options-container'
                style={{ display: settingsExpanded ? 'flex' : 'none' }}
              >
                <SegmentedControl
                  label='Layout orientation'
                  options={[
                    { label: 'Horizontal', value: 'horizontal' },
                    { label: 'Vertical', value: 'vertical' },
                  ]}
                  onValueChange={setLayoutOrientation}
                  defaultValue='horizontal'
                />
              </div>
            </div>
          </VisualizationWidgetBodySidebar>
          <VisualizationWidgetBodyContent>
            {data ? (
              <div className='bg-primary-gray-200 w-full'>
                {selectedTab === 'map' && selectedIndicator ? (
                  <div>map placeholder</div>
                ) : null}
                {selectedTab === 'ranks' && selectedIndicator ? (
                  <SingleGraphDashboard
                    dataSettings={{ data }}
                    graphType={
                      layoutOrientation === 'horizontal'
                        ? 'horizontalBarChart'
                        : 'verticalBarChart'
                    }
                    graphDataConfiguration={[
                      { columnId: 'Region name', chartConfigId: 'label' },
                      {
                        columnId: String(selectedIndicator.value),
                        chartConfigId: 'size',
                      },
                    ]}
                    graphSettings={{
                      graphTitle: selectedIndicator.label,
                      graphDescription: selectedIndicator.description,
                      padding: '16px 32px 16px 16px',
                      graphDownload: true,
                      dataDownload: true,
                      height: layoutOrientation === 'horizontal' ? 1200 : 600,
                      barPadding: 0.1,
                      leftMargin: layoutOrientation === 'horizontal' ? 180 : 32,
                      truncateBy: layoutOrientation === 'horizontal' ? 24 : 3,
                      sortData: 'desc',
                      showTicks: false,
                    }}
                  />
                ) : null}
                {selectedTab === 'trends' && selectedIndicator ? (
                  <SingleGraphDashboard
                    dataSettings={{ data }}
                    graphType='lineChart'
                    graphDataConfiguration={[
                      { columnId: 'Region name', chartConfigId: 'date' },
                      {
                        columnId: String(selectedIndicator.value),
                        chartConfigId: 'y',
                      },
                    ]}
                    graphSettings={{
                      graphTitle: selectedIndicator.label,
                      padding: '16px 32px 16px 16px',
                    }}
                  />
                ) : null}
                {selectedTab === 'disaggregations' && selectedIndicator ? (
                  <SingleGraphDashboard
                    dataSettings={{ data }}
                    graphType='horizontalDumbbellChart'
                    graphDataConfiguration={[
                      { columnId: 'Region name', chartConfigId: 'label' },
                      {
                        columnId: [
                          String(selectedIndicator.value),
                          String(selectedIndicator.value),
                        ],
                        chartConfigId: 'x',
                      },
                    ]}
                    graphSettings={{
                      graphTitle: selectedIndicator.label,
                      padding: '16px 32px 16px 16px',
                      graphDownload: true,
                      dataDownload: true,
                    }}
                  />
                ) : null}
                {selectedTab === 'table' && selectedIndicator ? (
                  <div>Table placeholder</div>
                ) : null}
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
