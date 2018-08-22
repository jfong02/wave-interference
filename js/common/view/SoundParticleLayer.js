// Copyright 2018, University of Colorado Boulder

/**
 * When selected, shows discrete and moving particles for the sound view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  class SoundParticleLayer extends Node {

    /**
     * @param {WavesScreenModel} model // TODO: pass a subset
     * @param {Node} waveAreaNode - for layout // TODO: just pass the modelViewTransform
     * @param {Object} [options]
     */
    constructor( model, waveAreaNode, options ) {
      super();
      const modelViewTransform = ModelViewTransform2.createRectangleMapping( model.soundScene.getWaveAreaBounds(), waveAreaNode.bounds );

      // Create one sphere node for each particle, some are randomly red.  There is a fixed number of particles, so
      // we can add them all during startup.
      model.soundParticles.forEach( soundParticle =>
        this.addChild( new ShadedSphereNode( 10, {
          x: modelViewTransform.modelToViewX( soundParticle.x ),
          y: modelViewTransform.modelToViewX( soundParticle.y ),
          mainColor: phet.joist.random.nextDouble() < 0.05 ? 'red' : 'green'
        } ) ) );
      this.mutate( options );

      // At the end of each model step, update all of the particles as a batch.
      model.stepEmitter.addListener( () => {
        model.soundParticles.forEach( ( soundParticle, i ) => {
          this.getChildAt( i ).mutate( {
            x: modelViewTransform.modelToViewX( soundParticle.x ),
            y: modelViewTransform.modelToViewX( soundParticle.y )
          } );
        } );
      } );
    }
  }

  return waveInterference.register( 'SoundParticleLayer', SoundParticleLayer );
} );