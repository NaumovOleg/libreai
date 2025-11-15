import { Observer } from '@observer';
import { ExecCommandPayload } from '@utils';

export const waitForUserConfirmation = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const observer = Observer.getInstance();

    const event = 'interact-command-' + id;

    const handler = (payload: ExecCommandPayload) => {
      observer.unsubscribe(event, handler);
      return resolve(payload.state === 'confirmed');
    };

    observer.subscribe(event, handler);
  });
};
