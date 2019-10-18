// Copyright 2018-2019, University of Colorado Boulder

/**
 * Panel subclass that applies styling specific to the Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const merge = require( 'PHET_CORE/merge' );
  const Panel = require( 'SUN/Panel' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  class WaveInterferencePanel extends Panel {

    /**
     * @param {Node} content
     * @param {Object} [options]
     */
    constructor( content, options ) {
      options = merge( {
        yMargin: 7,
        xMargin: 10,
        stroke: 'gray',
        fill: 'rgb(230,231,232)',
        cornerRadius: 6
      }, options );
      super( content, options );
    }
  }

  return waveInterference.register( 'WaveInterferencePanel', WaveInterferencePanel );
} );