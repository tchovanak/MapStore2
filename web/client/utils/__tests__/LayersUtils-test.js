/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const LayersUtils = require('../LayersUtils');

describe('LayersUtils', () => {
    it('splits layers and groups one group', () => {
        const state = LayersUtils.splitMapAndLayers({
            layers: [{
                name: "layer1",
                group: "group1"
            }, {
                name: "layer2",
                group: "group1"
            }]
        });
        expect(state.layers).toExist();
        expect(state.layers.flat).toExist();
        expect(state.layers.flat.length).toBe(2);
        expect(state.layers.groups.length).toBe(1);
    });

    it('splits layers and groups more groups', () => {
        const state = LayersUtils.splitMapAndLayers({
            layers: [{
                name: "layer1",
                group: "group1"
            }, {
                name: "layer2",
                group: "group2"
            }]
        });
        expect(state.layers).toExist();
        expect(state.layers.flat).toExist();
        expect(state.layers.flat.length).toBe(2);
        expect(state.layers.groups.length).toBe(2);
    });

    it('splits layers and groups groups additional data (expanded and title)', () => {
        const groups = [{id: 'custom.nested001', expanded: true}, {id: 'custom.nested001.nested002', expanded: false}, {id: 'Default', expanded: false}, {id: 'custom', expanded: true, title: {'default': 'Default', 'en-US': 'new'}}];
        const layers = [{id: 'layer001', group: 'Default'}, {id: 'layer002', group: 'Default'}, {id: 'layer003', group: 'custom.nested001'}, {id: 'layer004', group: 'custom.nested001.nested002'}];

        const state = LayersUtils.splitMapAndLayers({groups, layers});

        expect(state.layers.groups).toEqual([
            {expanded: true, id: 'custom', name: 'custom', title: {'default': 'Default', 'en-US': 'new'},
                nodes: [
                    {expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001',
                        nodes: [
                            {expanded: false, id: 'custom.nested001.nested002', name: 'nested002', title: 'nested002',
                                nodes: ['layer004']},
                            'layer003'
                        ]}
                ]
            },
            {expanded: false, id: 'Default', name: 'Default', nodes: ['layer002', 'layer001'], title: 'Default'}
        ]);
    });


    it('deep change in nested group', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.deepChange(nestedGroups, 'custom.nested001.nested002', 'value', 'changed');

        expect(newGroups).toExist();
        expect(newGroups).toEqual([
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'changed'}]}]}
        ]);

        const newGroupsWrongId = LayersUtils.deepChange(nestedGroups, 'nested005', 'value', 'changed');
        expect(newGroupsWrongId).toExist();
        expect(newGroupsWrongId).toEqual([
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ]);
    });

    it('get groups node id in nested group', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.getGroupNodes({nodes: nestedGroups});

        expect(newGroups).toExist();
        expect(newGroups).toEqual(['layer001', 'layer002', 'default', 'layer003', 'layer004', 'custom.nested001.nested002', 'custom.nested001', 'custom']);

    });

    it('get node', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.getNode(nestedGroups, 'custom.nested001.nested002');

        expect(newGroups).toExist();
        expect(newGroups).toEqual({id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'});

        const newGroupsNull = LayersUtils.getNode(nestedGroups, 'nested010');
        expect(newGroupsNull).toNotExist();
    });

    it('extract data from sources no state', () => {
        expect( LayersUtils.extractDataFromSources()).toBe(null);
        expect( LayersUtils.extractDataFromSources({})).toBe(null);
    });

    it('extract data from sources no sources object', () => {

        const mapState = {
            layers: [{
                id: 'layer:001',
                url: 'http:url001'
            }]
        };

        const layers = LayersUtils.extractDataFromSources(mapState);
        expect(layers).toEqual([
            {
                id: 'layer:001',
                url: 'http:url001'
            }
        ]);
    });

    it('extract data from sources', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const mapState = {
            mapInitialConfig: {
                sources
            },
            layers: [{
                id: 'layer:001',
                url: 'http:url001',
                tileMatrixSet: true,
                matrixIds: ['EPSG:4326', 'custom']
            }]
        };

        const layers = LayersUtils.extractDataFromSources(mapState);
        expect(layers).toEqual([
            {
                id: 'layer:001',
                url: 'http:url001',
                matrixIds: {
                    'EPSG:4326': [{
                        identifier: 'EPSG:4326:0',
                        ranges: undefined
                    }],
                    'custom': [{
                        identifier: 'custom:0',
                        ranges: undefined
                    }]
                },
                tileMatrixSet: [{
                    TileMatrix: [{
                        'ows:Identifier': 'EPSG:4326:0'
                    }],
                    'ows:Identifier': "EPSG:4326",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                }, {
                    TileMatrix: [{
                        'ows:Identifier': 'custom:0'
                    }],
                    'ows:Identifier': "custom",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                }]
            }
        ]);
    });

    it('extract matrix from sources no arguments', () => {
        expect( LayersUtils.extractTileMatrixFromSources()).toEqual({});
        expect( LayersUtils.extractTileMatrixFromSources(null, {})).toEqual({});
        expect( LayersUtils.extractTileMatrixFromSources({}, null)).toEqual({});
        expect( LayersUtils.extractTileMatrixFromSources({}, {})).toEqual({});
    });

    it('extract matrix from sources', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const layer = {
            id: 'layer:001',
            url: 'http:url001',
            tileMatrixSet: true,
            matrixIds: ['EPSG:4326', 'custom']
        };

        const {matrixIds, tileMatrixSet} = LayersUtils.extractTileMatrixFromSources(sources, layer);

        expect(matrixIds).toEqual({
            'EPSG:4326': [
                {
                    identifier: 'EPSG:4326:0',
                    ranges: undefined
                }
            ],
            'custom': [
                {
                    identifier: 'custom:0',
                    ranges: undefined
                }
            ]
        });

        expect(tileMatrixSet).toEqual([
            {
                TileMatrix: [
                    {
                        'ows:Identifier': 'EPSG:4326:0'
                    }
                ],
                'ows:Identifier': "EPSG:4326",
                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
            }, {
                TileMatrix: [
                    {
                        'ows:Identifier': 'custom:0'
                    }
                ],
                'ows:Identifier': "custom",
                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
            }
        ]);
    });

    it('extract matrix from sources no wmts layer', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const layer = {
            id: 'layer:001',
            url: 'http:url001'
        };

        expect(LayersUtils.extractTileMatrixFromSources(sources, layer)).toEqual({});
    });

});
