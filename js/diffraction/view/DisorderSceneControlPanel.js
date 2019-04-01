// Copyright 2019, University of Colorado Boulder

/**
 * Control panel for the RectangleScene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DiffractionNumberControl = require( 'WAVE_INTERFERENCE/diffraction/view/DiffractionNumberControl' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Panel = require( 'SUN/Panel' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  const circleDiameterString = require( 'string!WAVE_INTERFERENCE/circleDiameter' );
  const disorderString = require( 'string!WAVE_INTERFERENCE/disorder' );
  const latticeSpacingString = require( 'string!WAVE_INTERFERENCE/latticeSpacing' );

  class DisorderSceneControlPanel extends Panel {

    /**
     * @param {DisorderScene} disorderScene
     * @param {Object} [options]
     */
    constructor( disorderScene, options ) {
      super( new HBox( {
        spacing: WaveInterferenceConstants.DIFFRACTION_HBOX_SPACING,
        children: [
          new DiffractionNumberControl( circleDiameterString,
            disorderScene.diameterProperty.range.min,
            disorderScene.diameterProperty.range.max,
            disorderScene.diameterProperty ),
          new DiffractionNumberControl( latticeSpacingString,
            disorderScene.latticeSpacingProperty.range.min,
            disorderScene.latticeSpacingProperty.range.max,
            disorderScene.latticeSpacingProperty, {
              delta: 0.01
            } ),
          new DiffractionNumberControl( disorderString,
            disorderScene.disorderProperty.range.min,
            disorderScene.disorderProperty.range.max,
            disorderScene.disorderProperty, {
              delta: 1,
              sliderOptions: {
                majorTicks: [ {
                  value: disorderScene.disorderProperty.range.min,
                  label: new WaveInterferenceText( 'None' )
                }, {
                  value: disorderScene.disorderProperty.range.max,
                  label: new WaveInterferenceText( 'Lots' )
                } ]
              }
            } )
        ]
      } ), options );
    }
  }

  return waveInterference.register( 'DisorderSceneControlPanel', DisorderSceneControlPanel );
} );