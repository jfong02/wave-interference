// Copyright 2019, University of Colorado Boulder

/**
 * Control panel for the DisorderScene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DiffractionNumberControl = require( 'WAVE_INTERFERENCE/diffraction/view/DiffractionNumberControl' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Panel = require( 'SUN/Panel' );
  const Util = require( 'DOT/Util' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  const circleDiameterString = require( 'string!WAVE_INTERFERENCE/circleDiameter' );
  const disorderString = require( 'string!WAVE_INTERFERENCE/disorder' );
  const latticeSpacingString = require( 'string!WAVE_INTERFERENCE/latticeSpacing' );
  const nmValueString = require( 'string!WAVE_INTERFERENCE/nmValue' );

  class DisorderSceneControlPanel extends Panel {

    /**
     * @param {DisorderScene} disorderScene
     * @param {Object} [options]
     */
    constructor( disorderScene, options ) {
      super( new HBox( {
        spacing: WaveInterferenceConstants.DIFFRACTION_HBOX_SPACING,
        children: [
          new DiffractionNumberControl( circleDiameterString, disorderScene.diameterProperty, {
            delta: 10E-3,
            numberDisplayOptions: {
              valuePattern: nmValueString,
              decimalPlaces: 2
            },
            sliderOptions: {
              constrainValue: value => Util.roundToInterval( value, 10E-3 )
            }
          } ),
          new DiffractionNumberControl( latticeSpacingString, disorderScene.latticeSpacingProperty, {
            delta: 10E-3,
            numberDisplayOptions: {
              valuePattern: nmValueString,
              decimalPlaces: 2
            },
            sliderOptions: {
              constrainValue: value => Util.roundToInterval( value, 10E-3 )
            }
          } ),
          new DiffractionNumberControl( disorderString, disorderScene.disorderProperty, {
            numberDisplayOptions: {
              visible: false
            },
            sliderOptions: {
              majorTicks: [ {
                value: disorderScene.disorderProperty.range.min,
                label: new WaveInterferenceText( 'None' )
              }, {
                value: disorderScene.disorderProperty.range.max,
                label: new WaveInterferenceText( 'Lots' )
              } ],
              minorTickSpacing: 1
            }
          } )
        ]
      } ), options );
    }
  }

  return waveInterference.register( 'DisorderSceneControlPanel', DisorderSceneControlPanel );
} );