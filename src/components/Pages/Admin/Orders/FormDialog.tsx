import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ErrorMessage from 'components/Shared/ErrorMessage';
import TextField from 'components/Shared/Fields/Text';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import { useFormikObservable } from 'hooks/useFormikObservable';
import IOrder from 'interfaces/models/order';
import React, { forwardRef, Fragment, memo, useCallback } from 'react';
import { useRetryableObservable } from 'react-use-observable';
import orderService from 'services/order';
import { tap } from 'rxjs/operators';
import userService from 'services/user';
import * as yup from 'yup';

interface IProps {
  opened: boolean;
  order?: IOrder;
  onComplete: (order: IOrder) => void;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  description: yup.string().required().min(3).max(250),
  qtd: yup.number().required().min(1),
  price: yup.number().required()
});

const useStyle = makeStyles({
  content: {
    width: 600,
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const FormDialog = memo((props: IProps) => {
  const classes = useStyle(props);

  const formik = useFormikObservable<IOrder>({
    initialValues: { price: 0.0, qtd: 1 },
    validationSchema,
    onSubmit(model) {
      return orderService.save(model).pipe(
        tap(order => {
          Toast.show('Pedido criado!');
          props.onComplete(order);
        }),
        logError(true)
      );
    }
  });

  const [roles, rolesError, , retryRoles] = useRetryableObservable(() => {
    return userService.roles().pipe(logError());
  }, []);

  const handleEnter = useCallback(() => {
    formik.setValues(props.order ?? formik.initialValues, false);
  }, [formik, props.order]);

  const handleExit = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return (
    <Dialog
      open={props.opened}
      disableBackdropClick
      disableEscapeKeyDown
      onEnter={handleEnter}
      onExited={handleExit}
      TransitionComponent={Transition}
    >
      {formik.isSubmitting && <LinearProgress color='primary' />}

      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{formik.values.id ? 'Visualizar' : 'Novo'} Pedido</DialogTitle>
        <DialogContent className={classes.content}>
          {rolesError && <ErrorMessage error={rolesError} tryAgain={retryRoles} />}

          {!rolesError && (
            <Fragment>
              <Grid item xs={12} sm={12}>
                <TextField
                  label='Descri????o'
                  name='description'
                  formik={formik}
                  multiline
                  fullWidth
                  disabled={!!formik.values.id}
                />
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label='qtd' name='qtd' type='number' formik={formik} disabled={!!formik.values.id} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label='Pre??o' name='price' formik={formik} mask={'money'} disabled={!!formik.values.id} />
                </Grid>
              </Grid>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel}>Fechar</Button>
          {!formik.values.id && (
            <Button color='primary' variant='contained' type='submit' disabled={formik.isSubmitting || !roles}>
              Salvar
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
});

const Transition = memo(
  forwardRef((props: any, ref: any) => {
    return <Slide direction='up' {...props} ref={ref} />;
  })
);

export default FormDialog;
