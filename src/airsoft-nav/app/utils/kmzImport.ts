// KMZ GroundOverlay импорт: распаковываем .kmz, читаем doc.kml,
// вытаскиваем единственный <GroundOverlay> и сохраняем картинку в DocumentDirectory.
//
// Намеренно НЕ используем @mapbox/togeojson — он работает только с векторными KML.
// Для GroundOverlay структура простая, парсим вручную через @xmldom/xmldom.

import JSZip from 'jszip';
import RNFS from 'react-native-fs';
import {DOMParser} from '@xmldom/xmldom';

import {KMZLayer} from '@src/airsoft-nav/types/airsoft';

const KMZ_IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/kmz`;

export interface ParsedGroundOverlay {
    name: string;
    iconHref: string;
    bounds: {north: number; south: number; east: number; west: number};
    rotation: number;
}

const textOf = (node: Element | null): string => {
    if (!node) return '';
    return (node.textContent || '').trim();
};

const findFirstKml = (zip: JSZip): JSZip.JSZipObject => {
    // По стандарту KMZ корневой документ называется doc.kml. На всякий случай
    // ищем любой .kml в корне, если doc.kml не нашёлся.
    const root = zip.file('doc.kml');
    if (root) return root;
    const anyKml = zip.file(/\.kml$/i);
    if (anyKml.length === 0) {
        throw new Error('В KMZ-архиве не найден .kml файл');
    }
    return anyKml[0];
};

const parseGroundOverlay = (kmlText: string): ParsedGroundOverlay => {
    // @xmldom/xmldom 0.9.x: errorHandler-объект больше не поддерживается, нужен onError(level, msg).
    // Глушим warning/error, fatalError всё равно бросится исключением — это то, что нам нужно.
    const doc = new DOMParser({onError: () => {}}).parseFromString(kmlText, 'application/xml');

    const overlay = doc.getElementsByTagName('GroundOverlay')[0];
    if (!overlay) {
        throw new Error('KML не содержит GroundOverlay — поддерживаются только растровые KMZ');
    }

    const name = textOf(overlay.getElementsByTagName('name')[0] as unknown as Element) || 'Без названия';
    const iconHref = textOf(
        overlay.getElementsByTagName('Icon')[0]?.getElementsByTagName('href')[0] as unknown as Element,
    );
    if (!iconHref) {
        throw new Error('В GroundOverlay не указан Icon/href с картинкой');
    }

    const box = overlay.getElementsByTagName('LatLonBox')[0];
    if (!box) {
        throw new Error('В GroundOverlay не указан LatLonBox с координатами');
    }

    const north = parseFloat(textOf(box.getElementsByTagName('north')[0] as unknown as Element));
    const south = parseFloat(textOf(box.getElementsByTagName('south')[0] as unknown as Element));
    const east = parseFloat(textOf(box.getElementsByTagName('east')[0] as unknown as Element));
    const west = parseFloat(textOf(box.getElementsByTagName('west')[0] as unknown as Element));
    const rotation = parseFloat(textOf(box.getElementsByTagName('rotation')[0] as unknown as Element)) || 0;

    if ([north, south, east, west].some((v) => Number.isNaN(v))) {
        throw new Error('LatLonBox содержит некорректные координаты');
    }

    return {name, iconHref, bounds: {north, south, east, west}, rotation};
};

const ensureKmzDir = async () => {
    const exists = await RNFS.exists(KMZ_IMAGE_DIR);
    if (!exists) {
        await RNFS.mkdir(KMZ_IMAGE_DIR);
    }
};

// Принимает локальный путь к .kmz (полученный из DocumentPicker), возвращает
// KMZLayer без id (id назначит useMapSettingsMutations.addKMZLayer).
export const importKMZFile = async (kmzFileUri: string): Promise<Omit<KMZLayer, 'id'>> => {
    await ensureKmzDir();

    // DocumentPicker на Android может вернуть content:// URI — RNFS.readFile его понимает,
    // а вот JSZip требует бинарные данные. Сначала читаем как base64.
    const base64 = await RNFS.readFile(kmzFileUri, 'base64');
    const zip = await JSZip.loadAsync(base64, {base64: true});

    const kmlEntry = findFirstKml(zip);
    const kmlText = await kmlEntry.async('string');
    const parsed = parseGroundOverlay(kmlText);

    // Картинка лежит относительно корня KMZ (обычно files/<name>.jpg).
    const imageEntry = zip.file(parsed.iconHref);
    if (!imageEntry) {
        throw new Error(`Картинка ${parsed.iconHref} не найдена в KMZ`);
    }

    const layerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = parsed.iconHref.split('.').pop()?.toLowerCase() || 'jpg';
    const imagePath = `${KMZ_IMAGE_DIR}/${layerId}.${ext}`;

    const imageBase64 = await imageEntry.async('base64');
    await RNFS.writeFile(imagePath, imageBase64, 'base64');

    return {
        name: parsed.name,
        imagePath,
        bounds: parsed.bounds,
        rotation: parsed.rotation,
        opacity: 1,
        visible: true,
        importedAt: Date.now(),
    };
};

// Удалить файл картинки при удалении слоя.
export const deleteKMZImage = async (imagePath: string): Promise<void> => {
    try {
        const exists = await RNFS.exists(imagePath);
        if (exists) {
            await RNFS.unlink(imagePath);
        }
    } catch (e) {
        // Не критично — файл могли удалить вручную.
        console.warn('Не удалось удалить файл KMZ-картинки:', e);
    }
};
