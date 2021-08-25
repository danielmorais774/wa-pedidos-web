import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { IOption } from 'components/Shared/DropdownMenu';
import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import IOrder from 'interfaces/models/order';
import InfoCircleIcon from 'mdi-react/InfoCircleIcon';
import React, { memo, useCallback, useMemo, useState } from 'react';

interface IProps {
  order: IOrder;
  onEdit: (order: IOrder) => void;
  onDeleteComplete: () => void;
}

const ListItem = memo((props: IProps) => {
  const { order, onEdit } = props;

  const [deleted] = useState(false);
  const [loading] = useState(false);
  const [error, setError] = useState(false);

  const handleDismissError = useCallback(() => setError(null), []);

  const handleEdit = useCallback(() => {
    onEdit(order);
  }, [onEdit, order]);

  const options = useMemo<IOption[]>(() => {
    return [
      { text: 'Mais Informações', icon: InfoCircleIcon, handler: handleEdit },
    ];
  }, []);

  if (deleted) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>{order.description}</TableCell>
      <TableCell>{order.qtd}</TableCell>
      <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.price)}</TableCell>
      <TableCellActions options={options} loading={loading} error={error} onDismissError={handleDismissError} />
    </TableRow>
  );
});

export default ListItem;
