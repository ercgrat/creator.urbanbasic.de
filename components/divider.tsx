import { Divider as MUIDivider, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    divider: {
        margin: '0 -24px'
    }
});

export default function Divider() {
    const muiStyles = useStyles();
    return (
        <MUIDivider className={muiStyles.divider} />
    );
}