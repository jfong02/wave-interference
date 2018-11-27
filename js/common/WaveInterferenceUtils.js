// Copyright 2018, University of Colorado Boulder

/**
 * Utilities for Wave Interference
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  // constants
  const CELL_WIDTH = WaveInterferenceConstants.CELL_WIDTH;
  const POINT_SOURCE = WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE - WaveInterferenceConstants.LATTICE_PADDING;

  class WaveInterferenceUtils {


    /**
     * Gets a Shape representing the top of the water in water side view from left to right, also used for the chart.
     * @param {number[]} array - reused to avoid allocations
     * @param {Lattice} lattice
     * @param {Bounds2} waveAreaBounds
     * @param {number} dx
     * @param {number} dy
     * @returns {Shape}
     * @public
     */
    static getWaterSideShape( array, lattice, waveAreaBounds, dx, dy ) {
      lattice.getCenterLineValues( array );
      const shape = new Shape();

      for ( let i = 0; i < array.length; i++ ) {
        const value = ( i === POINT_SOURCE ) ? ( array[ i ] + 3 * array[ i - 1 ] + 3 * array[ i + 1 ] ) / 7 :
                      array[ i ];

        // Map the center of the cell to the same point on the graph, see https://github.com/phetsims/wave-interference/issues/143
        const x = Util.linear( -0.5, array.length - 1 + 0.5, waveAreaBounds.left, waveAreaBounds.right, i ) + dx;
        const y = WaveInterferenceUtils.getWaterSideY( waveAreaBounds, value ) + dy;
        shape.lineTo( x, y );
      }
      return shape;
    }

    /**
     * Finds the y-value at a specific point on the side wave.  This is used to see if a water drop has entered the
     * water in the side view.
     * @param {Bounds2} waveAreaBounds
     * @param {number} waveValue
     * @returns {number}
     */
    static getWaterSideY( waveAreaBounds, waveValue ) {
      return Util.linear( 0, 5, waveAreaBounds.centerY, waveAreaBounds.centerY - 80, waveValue );
    }

    /**
     * Gets the bounds to use for a canvas, in view coordinates
     * @param {Lattice} lattice
     * @public
     * @static
     */
    static getCanvasBounds( lattice ) {
      return new Bounds2( 0, 0, ( lattice.width - lattice.dampX * 2 ) * CELL_WIDTH, ( lattice.height - lattice.dampY * 2 ) * CELL_WIDTH );
    }

    /**
     * Convert a value to femto.
     * @param {number} value
     * @returns {number}
     * @public
     */
    static toFemto( value ) {
      return value * WaveInterferenceConstants.FEMTO;
    }

    /**
     * Convert a value from femto.
     * @param {number} value
     * @returns {number}
     * @public
     */
    static fromFemto( value ) {
      return value / WaveInterferenceConstants.FEMTO;
    }

    /**
     * Gets the horizontal coordinate where water drops come out--aligned with the oscillation cell.
     * @param {WavesScreenModel} model
     * @param {Bounds2} waveAreaViewBounds
     * @returns {number}
     */
    static getWaterDropX( model, waveAreaViewBounds ) {

      // Compute the x-coordinate where the drop should be shown.
      const sceneBounds = model.waterScene.lattice.visibleBounds;
      const transform = ModelViewTransform2.createRectangleMapping( sceneBounds, waveAreaViewBounds );

      // Note this is nudged over 1/2 a cell so it will appear in the center of the cell rather than
      // at the left edge of the cell.  See also WaveInterferenceUtils.getWaterSideShape.
      return transform.modelToViewX( WaveInterferenceConstants.POINT_SOURCE_HORIZONTAL_COORDINATE + 0.5 );
    }
  }

  return waveInterference.register( 'WaveInterferenceUtils', WaveInterferenceUtils );
} );