/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import property from './property';
import omit from 'lodash/omit';
import includes from 'lodash/includes';
import isObject from 'lodash/isObject';
import {SUPPORTED_MIME_TYPES} from "../../../utils/StyleEditorUtils";

const vector3dStyleOptions = {
    msClampToGround: property.msClampToGround({
        label: 'styleeditor.clampToGround'
    })
};

const INITIAL_OPTION_VALUE = '@ms-INITIAL_OPTION_VALUE';

const heightPoint3dOptions = {
    msHeightReference: property.msHeightReference({
        label: "styleeditor.heightReferenceFromGround"
    }),
    msHeight: property.multiInput({
        label: "styleeditor.height",
        key: "msHeight",
        isDisabled: (value, properties) => properties?.msHeightReference === 'clamp',
        initialOptionValue: INITIAL_OPTION_VALUE,
        getSelectOptions: ({ attributes }) => {
            const numberAttributes = attributes
                .map(({ label, attribute, type }) =>
                    type === "number" ? { label, value: attribute } : null
                )
                .filter((x) => !!x);
            return [
                { labelId: 'styleeditor.pointHeight', value: INITIAL_OPTION_VALUE },
                ...numberAttributes
            ];
        }
    })
};

const point3dStyleOptions = {
    msBringToFront: property.msBringToFront({
        label: "styleeditor.msBringToFront"
    }),
    ...heightPoint3dOptions
};

const polygon3dStyleOptions = {
    msClassificationType: property.msClassificationType({
        label: 'styleeditor.classificationtype'
    })
};

const getBlocks = ({
    exactMatchGeometrySymbol,
    enable3dStyleOptions
} = {}) => {
    const symbolizerBlock = {
        Mark: {
            kind: 'Mark',
            glyph: '1-point',
            glyphAdd: '1-point-add',
            tooltipAddId: 'styleeditor.addMarkRule',
            supportedTypes: exactMatchGeometrySymbol
                ? ['point', 'vector']
                : ['point', 'linestring', 'polygon', 'vector'],
            params: {
                wellKnownName: property.shape({
                    label: 'styleeditor.shape'
                }),
                color: property.color({
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    label: 'styleeditor.fill'
                }),
                strokeColor: property.color({
                    key: 'strokeColor',
                    opacityKey: 'strokeOpacity',
                    label: 'styleeditor.strokeColor',
                    stroke: true
                }),
                strokeWidth: property.width({
                    key: 'strokeWidth',
                    label: 'styleeditor.strokeWidth'
                }),
                radius: property.size({
                    key: 'radius',
                    label: 'styleeditor.radius'
                }),
                rotate: property.rotate({
                    label: 'styleeditor.rotation'
                }),
                ...(enable3dStyleOptions ? point3dStyleOptions : {})
            },
            defaultProperties: {
                kind: 'Mark',
                wellKnownName: 'Circle',
                color: '#dddddd',
                fillOpacity: 1,
                strokeColor: '#777777',
                strokeOpacity: 1,
                strokeWidth: 1,
                radius: 16,
                rotate: 0,
                msBringToFront: false,
                msHeightReference: 'none'
            }
        },
        Icon: {
            kind: 'Icon',
            glyph: 'point',
            glyphAdd: 'point-plus',
            tooltipAddId: 'styleeditor.addIconRule',
            supportedTypes: exactMatchGeometrySymbol
                ? ['point', 'vector']
                : ['point', 'linestring', 'polygon', 'vector'],
            hideMenu: true,
            params: {
                image: property.image({
                    label: 'styleeditor.image',
                    key: 'image'
                }),
                format: property.select({
                    label: 'styleeditor.format',
                    key: 'format',
                    isVisible: (value, { image } = {}, format) => {
                        return format !== 'css'
                        && !isObject(image)
                        && !['png', 'jpg', 'svg', 'gif', 'jpeg'].includes(image.split('.').pop());
                    },
                    getOptions: () => SUPPORTED_MIME_TYPES
                }),
                opacity: property.opacity({
                    label: 'styleeditor.opacity'
                }),
                size: property.size({
                    key: 'size',
                    label: 'styleeditor.size'
                }),
                rotate: property.rotate({
                    label: 'styleeditor.rotation'
                }),
                ...(enable3dStyleOptions ? point3dStyleOptions : {})
            },
            defaultProperties: {
                kind: 'Icon',
                image: '',
                opacity: 1,
                size: 32,
                rotate: 0,
                msBringToFront: false,
                msHeightReference: 'none'
            }
        },
        Line: {
            kind: 'Line',
            glyph: 'line',
            glyphAdd: 'line-plus',
            tooltipAddId: 'styleeditor.addLineRule',
            supportedTypes: exactMatchGeometrySymbol
                ? ['linestring', 'vector']
                : ['linestring', 'polygon', 'vector'],
            params: {
                color: property.color({
                    label: 'styleeditor.strokeColor',
                    stroke: true,
                    pattern: true,
                    getGroupParams: (kind) => symbolizerBlock[kind],
                    getGroupConfig: (kind) => {
                        if (kind === 'Mark') {
                            return { disableAlpha: true };
                        }
                        if (kind === 'Icon') {
                            return {
                                omittedKeys: ['rotate', 'opacity']
                            };
                        }
                        return {};
                    },
                    graphicKey: 'graphicStroke'
                }),
                width: property.width({
                    label: 'styleeditor.strokeWidth',
                    key: 'width'
                }),
                dasharray: property.dasharray({
                    label: 'styleeditor.lineStyle',
                    key: 'dasharray'
                }),
                cap: property.cap({
                    label: 'styleeditor.lineCap',
                    key: 'cap'
                }),
                join: property.join({
                    label: 'styleeditor.lineJoin',
                    key: 'join'
                }),
                ...(enable3dStyleOptions ? vector3dStyleOptions : {})
            },
            defaultProperties: {
                kind: 'Line',
                color: '#777777',
                width: 1,
                opacity: 1,
                cap: 'round',
                join: 'round',
                msClampToGround: true
            }
        },
        Fill: {
            kind: 'Fill',
            glyph: 'polygon',
            glyphAdd: 'polygon-plus',
            tooltipAddId: 'styleeditor.addFillRule',
            supportedTypes: ['polygon', 'vector'],
            params: {
                color: property.color({
                    label: 'styleeditor.fill',
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    pattern: true,
                    graphicKey: 'graphicFill',
                    getGroupParams: (kind) => symbolizerBlock[kind],
                    getGroupConfig: (kind) => {
                        if (kind === 'Mark') {
                            return {};
                        }
                        if (kind === 'Icon') {
                            return {
                                omittedKeys: ['rotate', 'opacity']
                            };
                        }
                        return {};
                    }
                }),
                outlineColor: property.color({
                    key: 'outlineColor',
                    opacityKey: 'outlineOpacity',
                    label: 'styleeditor.outlineColor',
                    stroke: true
                }),
                outlineWidth: property.width({
                    key: 'outlineWidth',
                    label: 'styleeditor.outlineWidth'
                }),
                ...(enable3dStyleOptions ? {...polygon3dStyleOptions, ...vector3dStyleOptions} : {})
            },
            defaultProperties: {
                kind: 'Fill',
                color: '#dddddd',
                fillOpacity: 1,
                outlineColor: '#777777',
                outlineWidth: 1,
                msClassificationType: 'both',
                msClampToGround: true
            }
        },
        PointCloud: {
            kind: 'Mark',
            glyph: '1-point',
            glyphAdd: '1-point-add',
            tooltipAddId: 'styleeditor.addMarkRule',
            supportedTypes: ['pointcloud'],
            hideMenu: true,
            params: {
                color: property.color({
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    label: 'styleeditor.fill'
                }),
                radius: property.size({
                    key: 'radius',
                    label: 'styleeditor.radius',
                    range: {
                        min: 1,
                        max: 10
                    }
                })
            },
            defaultProperties: {
                kind: 'Mark',
                wellKnownName: 'Circle',
                color: '#dddddd',
                fillOpacity: 1,
                radius: 1
            }
        },
        Polyhedron: {
            kind: 'Fill',
            glyph: 'polygon',
            glyphAdd: 'polygon-plus',
            tooltipAddId: 'styleeditor.addFillRule',
            supportedTypes: ['polyhedron'],
            hideMenu: true,
            params: {
                color: property.color({
                    label: 'styleeditor.fill',
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    pattern: true,
                    graphicKey: 'graphicFill',
                    getGroupParams: (kind) => symbolizerBlock[kind],
                    getGroupConfig: (kind) => {
                        if (kind === 'Mark') {
                            return {};
                        }
                        if (kind === 'Icon') {
                            return {
                                omittedKeys: ['rotate', 'opacity']
                            };
                        }
                        return {};
                    }
                })
            },
            defaultProperties: {
                kind: 'Fill',
                color: '#dddddd',
                fillOpacity: 1
            }
        },
        Model: {
            kind: 'Model',
            glyph: 'model',
            glyphAdd: 'model-plus',
            tooltipAddId: 'styleeditor.addModelRule',
            supportedTypes: enable3dStyleOptions ? ['point', 'vector'] : [],
            hideMenu: true,
            params: {
                model: property.model({
                    label: 'styleeditor.model',
                    key: 'model'
                }),
                scale: property.number({
                    key: 'scale',
                    label: 'styleeditor.scale',
                    fallbackValue: 1,
                    maxWidth: 80
                }),
                pitch: property.number({
                    key: 'pitch',
                    label: 'styleeditor.pitch',
                    fallbackValue: 0,
                    maxWidth: 105,
                    uom: '°'
                }),
                roll: property.number({
                    key: 'roll',
                    label: 'styleeditor.roll',
                    fallbackValue: 0,
                    maxWidth: 105,
                    uom: '°'
                }),
                heading: property.number({
                    key: 'heading',
                    label: 'styleeditor.heading',
                    fallbackValue: 0,
                    maxWidth: 105,
                    uom: '°'
                }),
                color: property.color({
                    key: 'color',
                    opacityKey: 'opacity',
                    label: 'styleeditor.color'
                }),
                ...(enable3dStyleOptions ? heightPoint3dOptions : {})
            },
            defaultProperties: {
                kind: 'Model',
                model: '',
                scale: 1,
                color: '#ffffff',
                opacity: 1,
                msHeightReference: 'none'
            }
        },
        Text: {
            kind: 'Text',
            glyph: 'font',
            tooltipAddId: 'styleeditor.addTextRule',
            supportedTypes: exactMatchGeometrySymbol
                ? ['point', 'vector']
                : ['point', 'linestring', 'polygon', 'vector'],
            params: {
                label: property.select({
                    key: 'label',
                    label: 'styleeditor.label',
                    selectProps: {
                        creatable: true
                    },
                    getOptions: ({ attributes }) => {
                        return attributes?.map((option) => ({
                            value: '{{' + option.attribute + '}}',
                            label: option.attribute
                        })) || [];
                    }
                }),
                font: property.select({
                    key: 'font',
                    label: 'styleeditor.fontFamily',
                    selectProps: {
                        multi: true
                    },
                    getOptions: ({ fonts }) => {
                        return fonts?.map((font) => ({
                            value: font,
                            label: font
                        })) || [];
                    }
                }),
                color: property.color({
                    label: 'styleeditor.fontColor',
                    key: 'color',
                    disableAlpha: true
                }),
                size: property.size({
                    label: 'styleeditor.fontSize',
                    key: 'size'
                }),
                fontStyle: property.fontStyle({
                    label: 'styleeditor.fontStyle',
                    key: 'fontStyle'
                }),
                fontWeight: property.fontWeight({
                    label: 'styleeditor.fontWeight',
                    key: 'fontWeight'
                }),
                haloColor: property.color({
                    label: 'styleeditor.haloColor',
                    key: 'haloColor',
                    stroke: true,
                    disableAlpha: true
                }),
                haloWidth: property.width({
                    label: 'styleeditor.haloWidth',
                    key: 'haloWidth'
                }),
                rotate: property.rotate({
                    label: 'styleeditor.rotation'
                }),
                offsetX: property.offset({
                    label: 'styleeditor.offsetX',
                    axis: 'x'
                }),
                offsetY: property.offset({
                    label: 'styleeditor.offsetY',
                    axis: 'y'
                }),
                ...(enable3dStyleOptions ? point3dStyleOptions : {})
            },
            defaultProperties: {
                kind: 'Text',
                color: '#333333',
                size: 14,
                fontStyle: 'normal',
                fontWeight: 'normal',
                haloColor: '#ffffff',
                haloWidth: 1,
                allowOverlap: true,
                offset: [0, 0],
                msBringToFront: false,
                msHeightReference: 'none'
            }
        },
        Raster: {
            kind: 'Raster',
            glyph: '1-raster',
            tooltipAddId: 'styleeditor.addRasterRule',
            supportedTypes: ['raster'],
            params: {
                channel: property.channel({}),
                opacity: property.opacity({
                    label: 'styleeditor.opacity'
                })
            },
            defaultProperties: {
                kind: 'Raster',
                opacity: 1,
                contrastEnhancement: {}
            }
        }
    };

    const ruleBlock = {
        Classification: {
            kind: 'Classification',
            glyph: 'list',
            classificationType: 'classificationVector',
            hideInputLabel: true,
            hideFilter: true,
            params: [
                {
                    ramp: property.colorRamp({
                        key: 'ramp',
                        label: 'styleeditor.colorRamp',
                        getOptions: ({ getColors }) => getColors()
                    }),
                    reverse: property.bool({
                        key: 'reverse',
                        label: 'styleeditor.reverse',
                        isDisabled: (value, properties) =>
                            properties?.ramp === 'custom'
                            || properties?.method === 'customInterval'
                    }),
                    attribute: property.select({
                        key: 'attribute',
                        label: 'styleeditor.attribute',
                        isValid: ({ value }) => value !== undefined,
                        getOptions: ({ attributes }) => {
                            return attributes?.map((option) => ({
                                value: option.attribute,
                                label: option.attribute,
                                disabled: option.disabled
                            }));
                        }
                    }),
                    method: property.select({
                        key: 'method',
                        label: 'styleeditor.method',
                        isDisabled: (value, properties, {attributes})=>
                            attributes?.filter(({label}) => label === properties?.attribute)?.[0]?.type === 'string'
                            && properties?.method !== 'customInterval',
                        getOptions: ({ methods, method, methodEdit }) => {
                            const options = methods?.map((value) => ({
                                labelId: 'styleeditor.' + value,
                                value
                            })) || [];
                            return [
                                ...(method === "customInterval"
                                    ? [
                                        {
                                            labelId: "styleeditor." + methodEdit,
                                            glyphId: 'edit',
                                            value: method
                                        }
                                    ]
                                    : []),
                                ...options
                            ];
                        }
                    }),
                    intervals: property.intervals({
                        label: 'styleeditor.intervals',
                        isDisabled: (value, properties) =>
                            includes(['customInterval', 'uniqueInterval'], properties?.method)
                    })
                },
                (symbolizerKind) => {
                    if (!symbolizerKind) {
                        return {};
                    }
                    switch (symbolizerKind) {
                    case 'Mark':
                        return {
                            fillOpacity: property.opacity({
                                key: 'fillOpacity',
                                label: 'styleeditor.opacity'
                            }),
                            ...omit(symbolizerBlock[symbolizerKind]?.params, ['color'])
                        };
                    case 'Line':
                        return {
                            opacity: property.opacity({
                                key: 'opacity',
                                label: 'styleeditor.opacity'
                            }),
                            ...omit(symbolizerBlock[symbolizerKind]?.params, ['color'])
                        };
                    case 'Fill':
                        return {
                            fillOpacity: property.opacity({
                                key: 'fillOpacity',
                                label: 'styleeditor.opacity'
                            }),
                            ...omit(symbolizerBlock[symbolizerKind]?.params, ['color'])
                        };
                    default:
                        return symbolizerBlock[symbolizerKind]?.params;
                    }
                },
                {
                    classification: property.colorMap({
                        key: 'classification',
                        rampKey: 'ramp'
                    })
                }
            ],
            defaultProperties: {
                kind: 'Classification',
                classification: [],
                intervals: 5,
                method: 'equalInterval',
                ramp: 'orrd',
                reverse: false
            }
        },
        Raster: {
            kind: 'Raster',
            glyph: '1-raster',
            classificationType: 'classificationRaster',
            hideInputLabel: false,
            hideFilter: true,
            params: [
                {
                    channel: property.channel({}),
                    opacity: property.opacity({
                        label: 'styleeditor.opacity'
                    }),
                    ramp: property.colorRamp({
                        key: 'ramp',
                        label: 'styleeditor.colorRamp',
                        getOptions: ({ getColors }) => getColors()
                    }),
                    reverse: property.bool({
                        key: 'reverse',
                        label: 'styleeditor.reverse',
                        isDisabled: (value, properties) =>
                            properties?.ramp === 'custom'
                            || properties?.method === 'customInterval'
                    }),
                    continuous: property.bool({
                        key: 'continuous',
                        label: 'styleeditor.continuous',
                        isDisabled: (value, properties) =>
                            properties?.ramp === 'custom'
                            || properties?.method === 'customInterval'
                    }),
                    colorMapType: property.colorMapType({
                        key: 'colorMapType',
                        label: 'styleeditor.colorMapType.label'
                    }),
                    method: property.select({
                        key: 'method',
                        label: 'styleeditor.method',
                        getOptions: ({ methods, method, methodEdit }) => {
                            const options = methods?.map((value) => ({
                                labelId: 'styleeditor.' + value,
                                value
                            })) || [];
                            return [
                                ...(method === "customInterval"
                                    ? [
                                        {
                                            labelId: "styleeditor." + methodEdit,
                                            glyphId: 'edit',
                                            value: method
                                        }
                                    ]
                                    : []),
                                ...options
                            ];
                        }
                    }),
                    intervals: property.intervals({
                        label: 'styleeditor.intervals'
                    })
                },
                {
                    classification: property.colorMap({
                        key: 'classification',
                        rampKey: 'ramp'
                    })
                }
            ],
            defaultProperties: {
                kind: 'Raster',
                opacity: 1,
                classification: [],
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                continuous: true,
                colorMapType: 'ramp',
                symbolizerKind: 'Raster'
            }
        }
    };

    return { symbolizerBlock, ruleBlock };
};

export default getBlocks;
