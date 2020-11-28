import { Divider as MUIDivider, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    divider: {
        margin: '0 -16px',
    },
});

const Divider: React.FC = () => {
    const muiStyles = useStyles();
    return <MUIDivider className={muiStyles.divider} />;
};

export default Divider;
