/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = simLauncher.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();
const onDecodeSuccess = decodedAudio => {
  wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
  unlock();
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 0, phetAudioContext.sampleRate ) );
  unlock();
};
phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
export default wrappedAudioBuffer;