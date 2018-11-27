// Copyright 2018, University of Colorado Boulder

/**
 * For the light scene, shows one laser pointer for each emitter, each with its own on/off button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const EmitterNode = require( 'WAVE_INTERFERENCE/common/view/EmitterNode' );
  const LaserPointerNode = require( 'SCENERY_PHET/LaserPointerNode' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  // constants
  const DEFAULT_OPTIONS = {
    bodySize: new Dimension2( 80, 40 ),
    nozzleSize: new Dimension2( 10, 28 ),
    hasGlass: true,
    hasButton: false
  };

  class LightEmitterNode extends EmitterNode {

    /**
     * @param {WavesScreenModel} model
     * @param {Node} waveAreaNode - for bounds
     * @param {boolean} isPrimarySource
     */
    constructor( model, waveAreaNode, isPrimarySource ) {
      let scene = model.lightScene;
      const laserPointerNode = new LaserPointerNode( scene.button1PressedProperty, _.extend( {
        rightCenter: waveAreaNode.leftCenter.plusXY( 20, 0 )
      }, DEFAULT_OPTIONS ) );
      super( model, scene, waveAreaNode, 70, isPrimarySource, laserPointerNode );
    }

    /**
     * Returns the defaults
     * @returns {Object}
     * @public
     */
    static get DEFAULT_OPTIONS() {
      return DEFAULT_OPTIONS;
    }
  }

  return waveInterference.register( 'LightEmitterNode', LightEmitterNode );
} );