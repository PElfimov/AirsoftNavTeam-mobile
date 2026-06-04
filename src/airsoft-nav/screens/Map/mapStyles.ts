export type MapStyleId = 'standard' | 'satellite' | 'hybrid';

const OSM_TILES = ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'];
const ESRI_IMAGERY = [
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
];
const ESRI_LABELS = [
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
];

const standardStyle = {
    version: 8,
    sources: {
        osm: {
            type: 'raster',
            tiles: OSM_TILES,
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19,
        },
    },
    layers: [{id: 'osm', type: 'raster', source: 'osm'}],
};

const satelliteStyle = {
    version: 8,
    sources: {
        esri: {
            type: 'raster',
            tiles: ESRI_IMAGERY,
            tileSize: 256,
            attribution: '© Esri',
            maxzoom: 19,
        },
    },
    layers: [{id: 'esri', type: 'raster', source: 'esri'}],
};

const hybridStyle = {
    version: 8,
    sources: {
        esri: {
            type: 'raster',
            tiles: ESRI_IMAGERY,
            tileSize: 256,
            attribution: '© Esri',
            maxzoom: 19,
        },
        labels: {
            type: 'raster',
            tiles: ESRI_LABELS,
            tileSize: 256,
            maxzoom: 19,
        },
    },
    layers: [
        {id: 'esri', type: 'raster', source: 'esri'},
        {id: 'labels', type: 'raster', source: 'labels'},
    ],
};

const styles: Record<MapStyleId, object> = {
    standard: standardStyle,
    satellite: satelliteStyle,
    hybrid: hybridStyle,
};

export const getMapStyleJSON = (mapType: MapStyleId): string => JSON.stringify(styles[mapType]);
