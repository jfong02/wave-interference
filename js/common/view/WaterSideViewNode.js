// Copyright 2018, University of Colorado Boulder

/**
 * Shows the water from the side view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Path = require( 'SCENERY/nodes/Path' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceUtils = require( 'WAVE_INTERFERENCE/common/WaveInterferenceUtils' );

  // constants
  // the location in the un-padded lattice array where the source appears
  const SOURCE_INDEX = WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE -
                       WaveInterferenceConstants.LATTICE_PADDING;

  class WaterSideViewNode extends Path {

    /**
     * @param {Bounds2} waveAreaBounds
     * @param {WavesScreenModel} model
     */
    constructor( waveAreaBounds, model ) {

      // @private - depicts the side face (when the user selects "side view")
      super( null, {
        lineJoin: WaveInterferenceConstants.CHART_LINE_JOIN,
        fill: WaveInterferenceConstants.WATER_SIDE_COLOR
      } );

      // @private
      this.waveAreaBounds = waveAreaBounds;

      // @private
      this.model = model;

      // @private - reduce garbage by reusing the same array to get model values
      this.array = [];

      model.waterScene.lattice.changedEmitter.addListener( () => this.update() );
    }

    /**
     * @private - update the shape when the rotationAmount or lattice has changed
     */
    update() {
      var bounds = this.waveAreaBounds;
      this.shape = WaveInterferenceUtils.getWaterSideShape( this.array, this.model.waterScene.lattice, bounds, 0, 0 )
        .lineTo( bounds.right, bounds.maxY )
        .lineTo( bounds.left, bounds.maxY )
        .close();

      // Look up the height of the topmost curve.  Do this after getWaterSideShape since we read a value
      // from the array.  Used to determine if a water drop has fallen into the water.
      this.waterSideViewNodeTopY = WaveInterferenceUtils.getWaterSideY( bounds, this.array[ SOURCE_INDEX ] );
    }
  }

  return waveInterference.register( 'WaterSideViewNode', WaterSideViewNode );
} );