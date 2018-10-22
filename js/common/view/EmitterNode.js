// Copyright 2018, University of Colorado Boulder

/**
 * For each scene, shows one node for each emitter, each with its own on/off button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const IncomingWaveType = require( 'WAVE_INTERFERENCE/common/model/IncomingWaveType' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  const ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  class EmitterNode extends Node {

    /**
     * @param {WavesScreenModel} model
     * @param {Scene} scene
     * @param {Node} waveAreaNode - for bounds
     * @param {number} buttonPosition - x offset
     * @param {boolean} isPrimarySource
     * @param {Node} sourceNode - for the emitters, shared with scenery DAG
     * @param {number} [verticalOffset] - offset for the hose, so the water has some distance to fall
     * @param {number} [buttonOffset] - offset for the button, so it can be positioned on the pipe
     * @param {boolean} [showButtonBackground] - true if a new background for the button should be added
     */
    constructor( model, scene, waveAreaNode, buttonPosition, isPrimarySource, sourceNode, verticalOffset = 0, buttonOffset = 0, showButtonBackground = false ) {
      const buttonOptions = {
        centerY: sourceNode.centerY + buttonOffset,
        left: buttonPosition,
        baseColor: WaveInterferenceConstants.EMITTER_BUTTON_COLOR,
        radius: WaveInterferenceConstants.EMITTER_BUTTON_RADIUS
      };

      const button = new RoundStickyToggleButton( false, true, isPrimarySource ? model.button1PressedProperty : model.button2PressedProperty, buttonOptions );
      const children = [ sourceNode ];
      if ( showButtonBackground ) {
        const diameter = button.width * 1.3;
        children.push( new ShadedSphereNode( diameter, {
          center: button.center,
          mainColor: '#b1b1b1',
          highlightColor: 'white',
          shadowColor: 'black',
          highlightXOffset: -0.2,
          highlightYOffset: -0.5
        } ) );
      }
      children.push( button );
      const nodeWithButton = new Node( { children } );

      const updateEnabled = () => {
        if ( model.inputTypeProperty.value === IncomingWaveType.PULSE ) {
          button.enabled = !model.pulseFiringProperty.value;
        }
        else if ( model.inputTypeProperty.value === IncomingWaveType.CONTINUOUS ) {
          button.enabled = true;
        }
      };
      model.inputTypeProperty.link( updateEnabled );
      model.pulseFiringProperty.link( updateEnabled );
      super( {
        children: [ nodeWithButton ]
      } );

      const modelViewTransform = ModelViewTransform2.createRectangleMapping( scene.getWaveAreaBounds(), waveAreaNode.bounds );

      // @protected {Property.<number>} vertical offset, used by WaterEmitterNode
      this.centerYProperty = new Property();

      const sourceSeparationProperty = scene.desiredSourceSeparationProperty || scene.sourceSeparationProperty;
      sourceSeparationProperty.link( sourceSeparation => {
        if ( !isPrimarySource ) {
          nodeWithButton.visible = sourceSeparation > 0;
        }
        const sign = isPrimarySource ? 1 : -1;
        const viewSeparation = modelViewTransform.modelToViewDeltaY( sourceSeparation );

        this.centerYProperty.value = waveAreaNode.centerY + sign * viewSeparation / 2;
        nodeWithButton.centerY = this.centerYProperty.value + verticalOffset;
      } );
    }
  }

  return waveInterference.register( 'EmitterNode', EmitterNode );
} );