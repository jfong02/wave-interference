// Copyright 2018, University of Colorado Boulder

/**
 * Model for the Slits screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveSpatialType = require( 'WAVE_INTERFERENCE/common/model/WaveSpatialType' );
  const WavesScreenModel = require( 'WAVE_INTERFERENCE/waves/model/WavesScreenModel' );

  class SlitsScreenModel extends WavesScreenModel {

    constructor() {
      super( {

        //REVIEW There's an extended comment about the default value for initialAmplitude over in WaveScreenModel, and it's not 10. Why did you choose this value here?
        //REVIEW*: By design, the Slits screen is supposed to start at the max amplitude value.  I've refactored
        //REVIEW* to indicate that.  Please review.
        initialAmplitude: WaveInterferenceConstants.AMPLITUDE_RANGE.max,
        waveSpatialType: WaveSpatialType.PLANE,

        // SoundParticles are not displayed on the Slits screen,
        // see https://github.com/phetsims/wave-interference/issues/109
        showSoundParticles: false
      } );
    }

    /**
     * There are no water drops in this scene, and hence the slider controls the frequency directly.
     * @override
     * @public
     */
    getWaterFrequencySliderProperty() {
      return this.waterScene.frequencyProperty;
    }
  }

  return waveInterference.register( 'SlitsScreenModel', SlitsScreenModel );
} );