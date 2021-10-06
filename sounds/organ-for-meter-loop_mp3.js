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
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  unlock();
};
phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError ).catch( e => { console.warn( 'promise rejection caught for audio decode, error = ' + e ) } );
export default wrappedAudioBuffer;