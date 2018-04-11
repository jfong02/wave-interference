// Copyright 2018, University of Colorado Boulder

/**
 * Buttons for play/pause radio buttons for normal/slow
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var PlaySpeedEnum = require( 'WAVE_INTERFERENCE/common/model/PlaySpeedEnum' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );
  var WaveInterferenceVerticalAquaRadioButtonGroup = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceVerticalAquaRadioButtonGroup' );

  // strings
  var normalString = require( 'string!WAVE_INTERFERENCE/normal' );
  var slowString = require( 'string!WAVE_INTERFERENCE/slow' );

  /**
   * @constructor
   */
  function TimeControlPanel( model, options ) {

    // @public (read-only) for layout
    this.playPauseButton = new PlayPauseButton( model.isRunningProperty );

    var radioButtonGroup = new WaveInterferenceVerticalAquaRadioButtonGroup( [ {
      node: new WaveInterferenceText( normalString ),
      value: PlaySpeedEnum.NORMAL,
      property: model.playSpeedProperty
    }, {
      node: new WaveInterferenceText( slowString ),
      value: PlaySpeedEnum.SLOW,
      property: model.playSpeedProperty
    } ] );

    var stepButton = new StepButton();
    stepButton.addListener( function() {

      // If we need to move forward further than one frame, call advanceTime several times rather than increasing the
      // dt, so the model will behave the same
      model.advanceTime( 1 / 60 );
    } );

    // Only enable the step button when the model is paused.
    model.isRunningProperty.link( function( isRunning ) {
      stepButton.enabled = !isRunning;
    } );

    HBox.call( this, _.extend( {
      spacing: 20,
      children: [ new HBox( {
        spacing: 6,
        children: [ this.playPauseButton, stepButton ]
      } ), radioButtonGroup ]
    }, options ) );
  }

  waveInterference.register( 'TimeControlPanel', TimeControlPanel );

  return inherit( HBox, TimeControlPanel );
} );