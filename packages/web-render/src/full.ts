import { install } from '@neep/core';
import render from '.';
import * as monitorable from 'monitorable';

install({ render, monitorable });

export * from '@neep/core';
