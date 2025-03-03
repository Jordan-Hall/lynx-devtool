import { initialize } from '@electron/remote/main';
import ldt from './App';

// Initialize before creating any window
initialize();

ldt.init();
