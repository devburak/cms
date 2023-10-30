import { useEffect, useLayoutEffect } from 'react';
import { CAN_USE_DOM } from './canUseDom';

const useLayoutEffectImpl = CAN_USE_DOM ? useLayoutEffect : useEffect;

export default useLayoutEffectImpl;
