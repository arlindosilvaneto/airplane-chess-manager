import {
  Heading, Table, Dialog, Stack, Text, Button, useComponentState,
  Switch, Label, showNotification, Form, TextInput, Chart, Loader
} from "@airplane/views";
import airplane from "airplane";
import {PlusIconSolid, ChartBarIconOutline} from '@airplane/views/icons';
import { SetStateAction, useEffect, useState, useCallback } from "react";
import {updateElo} from './calculateRatingUpdate';

const DEFAULT_K_FACTOR = 20;

type Updates = {playerRating: number, playerScore: number, opponentRating: number, opponentScore: number}
type Player = {id: string, rating: any[], _id: string, meta: any, progress: any[]}

const EloRatingSystem = () => {
  const { id: tableId, selectedRows, clearSelection } = useComponentState('players-table');
  const { id: modalId, open, close } = useComponentState('game-modal');
  const { id: createModalId, open: createOpen, close: createClose } = useComponentState('user-modal');
  const { id: progressModalId, open: progressOpen, close: progressClose } = useComponentState('progress-modal');
  const { id: switchId, checked } = useComponentState('game-switch');
  const { id: drawSwitchId, checked: draw } = useComponentState('draw-switch');
  const { id: kId, value: kFactor = DEFAULT_K_FACTOR } = useComponentState('user-name-input');
  const { id: userNameId, value: userName } = useComponentState('user-name-input');
  const { id: userRatingId, value: userRating } = useComponentState('user-rating-input');
  const [updates, setUpdates] = useState({} as Updates);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [createLoading, setCreatingLoading] = useState(false);
  const [userData, setUserData] = useState([] as SetStateAction<any | Player[]>);
  const [playerProgress, setPlayerProgress] = useState({} as Player);

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (selectedRows.length === 2) {
      open();
    }
  }, [selectedRows]);

  useEffect(() => {
    if(selectedRows.length === 2) {
      const eloUpdates = updateElo({
        playerRating: selectedRows[0].rating, 
        opponentRating: selectedRows[1].rating, 
        score: draw ? 0.5 : (checked ? 1 : 0),
        kFactor
      });

      setUpdates(eloUpdates);
    }
  }, [selectedRows, draw, checked, kFactor]);

  const onModalClose = () => {
    clearSelection();
    close();
  }

  const lastRating = (data: Player[]) => {
    return data.map((player) => ({
      ...player,
      progress: player.rating.map((rating, index) => ({timestamp: index + 1, rating: rating.rating})),
      rating: player.rating[player.rating.length - 1].rating
    }));
  }

  const openChart = (row: Player) => {
    setPlayerProgress(row);
    progressOpen();
  }
  
  const rowActions = ({ row }) => {
    return <>
      <Button rightIcon={<ChartBarIconOutline />} variant="filled" preset="secondary" onClick={() => openChart(row)}>Rating Progress</Button>
    </>;
  }

  const getUserData = useCallback(async () => {
    try {
    setDataLoading(true);
    const players = (await airplane.execute<Player[]>('get_all_users', {})).output;

    setUserData(lastRating(players));
    } catch(e) {
      console.log(e);
      showNotification({ message: 'Something went wrong during players fetch!', type: 'error' });
    }

    setDataLoading(false);
  }, []);

  const updateUserRatings = useCallback(async () => {
    setLoading(true);

    try{
      await airplane.execute('update_user_rating', {
        user_id: selectedRows[0]?.id,
        score: updates.playerScore,
        rating: updates.playerRating
      });

      await airplane.execute('update_user_rating', {
        user_id: selectedRows[1]?.id,
        score: updates.opponentScore,
        rating: updates.opponentRating
      });      

      showNotification({ message: 'Rating Updated Successfuly!', type: 'success' });
    } catch(e) {
      console.log(e);
      showNotification({ message: 'Something went wrong during rating update!', type: 'error' });
    }

    setLoading(false);
    onModalClose();

    await getUserData();
  }, [selectedRows, updates]);

  const createNewUser = async () => {
    setCreatingLoading(true);

    try {
      await airplane.execute('update_user_rating', {
        user_id: userName,
        rating: userRating
      });

      showNotification({ message: `User ${userName} successfully created!`, type: 'success' });      
    } catch(e) {
      showNotification({ message: 'Something went wrong during create new player!', type: 'error' });
    }

    setCreatingLoading(false);
    createClose();

    await getUserData();
  }

  return (
    <>
      <Stack spacing="lg">
        <Stack spacing={0}>
          <Heading color="primary">ELO Rating System</Heading>
          <Text color="green">Manage ELO rating for players</Text>
        </Stack>
        {!dataLoading && <Stack direction="row">
          <Button rightIcon={<PlusIconSolid />} onClick={createOpen}>Create Player</Button>
        </Stack>}
        <Stack direction="row">
          {dataLoading ? 
          <Loader variant="dots" size="xl" color="green" /> :
          <Table title="Players" id={tableId} defaultPageSize={10} data={userData}
            hiddenColumns={['_id', 'meta', 'progress']}
            rowActions={rowActions} rowSelection="checkbox" />
          }
        </Stack>
      </Stack>

      <Dialog id={modalId} title="Players Game Manager" onClose={onModalClose}>
        <Stack>
          <Switch id={drawSwitchId} label="Draw" onLabel="Yes" offLabel="No" size="lg" />
          {!draw && <Switch id={switchId} label={checked ? `${selectedRows[0]?.id} Won` : `${selectedRows[1]?.id} Won`}
            onLabel={selectedRows[0]?.id} offLabel={selectedRows[1]?.id} size="lg" />}          
          <TextInput id={kId} label="K Factor" type="number" defaultValue="20" />
          <Label color="green">Rating Changes</Label>
          <Table columns={[{
            label: "Player",
            accessor: "player"
          }, {
            label: "Rating",
            accessor: "rating"
          },{
            label: "Novo Rating",
            accessor: "newRating"
          }]} data={[{
            player: selectedRows[0]?.id,
            rating: selectedRows[0]?.rating,
            newRating: updates.playerRating,
          }, {
            player: selectedRows[1]?.id,
            rating: selectedRows[1]?.rating,
            newRating: updates.opponentRating,
          }]} />
          <Button onClick={updateUserRatings} loading={loading}>Confirm Update</Button>
        </Stack>
      </Dialog>

      <Dialog id={createModalId} title="Create Player" onClose={createClose}>
        <Form onSubmit={createNewUser} submitting={createLoading}>
          <TextInput id={userNameId} label="New player name" />
          <TextInput id={userRatingId} label="New player rating" type="number" />
        </Form>
      </Dialog>

      <Dialog id={progressModalId} title="Player Progress" onClose={progressClose} fullScreen={true}>
        <Chart
          type="line"
          title={`${playerProgress.id} Progress`}
          xAxisTitle="Time"
          xAxis="timestamp"
          yAxisTitle="Rating"
          data={playerProgress.progress}
        />
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
