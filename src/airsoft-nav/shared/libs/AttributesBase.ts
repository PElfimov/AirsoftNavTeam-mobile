export type TAttibuteType = 'string' | 'float' | 'int' | 'bool' | 'json' | 'boolean';

export interface IAttribute<T> {
    key: T;
    value: string;
    type?: TAttibuteType;
}

export interface IAttributesBase<T> {
    attributes: IAttribute<T>[];
}

export default class AttributesBase<T> implements IAttributesBase<T> {
    readonly attributes: IAttribute<T>[];

    constructor(props: IAttributesBase<T>) {
        this.attributes = props.attributes || [];
    }

    public getAttributeTypeByKey(key: T): string | undefined {
        return this.attributes.find((attribute) => attribute.key === key)?.type;
    }

    public getAttributeValueByKey(key: T): string | undefined {
        return this.attributes.find((attribute) => attribute.key === key)?.value;
    }

    public getParsedAttributeValueByKey(key: T): unknown {
        const attribute = this.attributes.find((attribute) => attribute.key === key);
        switch (attribute?.type?.toLowerCase()) {
            case 'boolean':
            case 'bool':
                return attribute.value.toLowerCase() === 'true';
            case 'float':
                return parseFloat(attribute.value);
            case 'int':
                return parseInt(attribute.value, 10);
            case 'json':
                return JSON.parse(attribute.value);
            default:
                return attribute?.value;
        }
    }

    public setAttributeValueByKey(key: T, value: string): IAttribute<T>[] {
        const newAttributes = JSON.parse(JSON.stringify(this.attributes));
        const existedAttribute = newAttributes.find((attributes) => attributes.key === key);
        if (existedAttribute) {
            existedAttribute.value = value;
        } else {
            newAttributes.push({key, value});
        }
        return newAttributes;
    }

    public removeAttributeValueByKey(key: T): IAttribute<T>[] {
        const newAttributes = JSON.parse(JSON.stringify(this.attributes));
        return newAttributes.filter((attribute) => attribute.key !== key);
    }
}
