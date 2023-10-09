import {
  Heading, Table, Dialog, Stack, Text, Button, useComponentState,
  Switch, Label, showNotification
} from "@airplane/views";
import airplane from "airplane";
import { useEffect } from "react";

const lastRating = (data) => {
  return data.map((player) => {
    return {
      ...player,
      rating: player.rating[player.rating.length - 1].rating
    };
  })
}

const rowActions = ({ row }) => {
  return <>
    <Button variant="filled" preset="primary">Play</Button>
    <Button variant="filled" preset="tertiary">Progress</Button>
  </>;
}

const EloRatingSystem = () => {
  const { id: tableId, selectedRows, clearSelection } = useComponentState('players-table');
  const { id: modalId, open, close } = useComponentState('game-modal');
  const { id: switchId, checked } = useComponentState('game-switch');

  useEffect(() => {
    if (selectedRows.length == 2) {
      open();
    }
  }, [selectedRows]);

  const onModalClose = () => {
    clearSelection();
    close();
  }

  return (
    <>
      <Stack spacing="lg">
        <Stack spacing={0}>
          <Heading>ELO Rating System</Heading>
          <Text>Manage ELO rating for players</Text>
        </Stack>
        <Stack direction="row">
          <Table title="Players" id={tableId} defaultPageSize={3} task="get_all_users"
            outputTransform={lastRating} hiddenColumns={['_id', 'meta']}
            rowActions={rowActions} rowSelection="checkbox" />
        </Stack>
      </Stack>

      <Dialog id={modalId} title="Game Manager" onClose={onModalClose}>
        <Stack>
          <Switch id={switchId} label={checked ? `${selectedRows[0]?.id} Won` : `${selectedRows[1]?.id} Won`}
            onLabel={selectedRows[0]?.id} offLabel={selectedRows[1]?.id} size="lg" />
          <Label>Rating Changes</Label>
          <Table columns={[{
            label: "Player",
            accessor: "player"
          }, {
            label: "Rating Change",
            accessor: "ratingChange"
          }]} data={[{
            player: selectedRows[0]?.id,
            ratingChange: 10,
          }, {
            player: selectedRows[1]?.id,
            ratingChange: -10,
          }]} />
          <Button
            task={{
              slug: 'update_user_rating',
              params: {
                user_id: checked ? selectedRows[0]?.id : selectedRows[1]?.id,
                rating: (checked ? selectedRows[0]?.rating : selectedRows[1]?.rating) + 10
              },
              onSuccess: () => {
                showNotification({ message: 'Rating Updated Successfuly!' });
                onModalClose();
              }
            }}>Confirm Update</Button>
        </Stack>
      </Dialog>
    </>
  );
};

export default airplane.view(
  {
    slug: "elo_rating_system",
    name: "ELO Rating System",
  },
  EloRatingSystem
);
