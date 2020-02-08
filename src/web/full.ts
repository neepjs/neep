import { install } from '../core';
import render from './render';
import * as monitorable from 'monitorable';

install({ render, monitorable });

export * from '../core';
