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