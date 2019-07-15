import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { List, ListItem, ListItemText } from '@material-ui/core';
import Game from './Game';

function MadeBySteve() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Built out of curiosity by '}
      <Link color="inherit" href="http://github.com/heyjuststart">
        Steve
      </Link>
    </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: 'none'
  },
  title: {
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  },
  fixedHeight: {
    minHeight: 240,
    height: '100%'
  }
}));

const rules = [
  'If a cell is alive and has 2 or 3 neighbors, then it remains alive, otherwise it dies.',
  'If a cell is dead and has exactly 3 neighbors, then it comes to life, otherwise it remains dead.'
];

export default function Dashboard() {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <main className={classes.content}>
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography align="center" component="h1" variant="h2">
                  Conway's Game of Life
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={7} md={8} lg={9}>
              <Paper className={fixedHeightPaper}>
                <Game />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={5} md={4} lg={3}>
              <Paper className={fixedHeightPaper}>
                <Typography align="center" component="h1" variant="h5">
                  Rules:
                </Typography>
                <List>
                  {rules.map((r, i) => (
                    <ListItem key={i}>
                      <ListItemText>{r}</ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography component="p">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <MadeBySteve />
      </main>
    </div>
  );
}
