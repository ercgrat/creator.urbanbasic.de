import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import netlifyIdentity from "netlify-identity-widget";
import React, { useContext, useEffect, useState } from "react";
import Page from "../../components/page";
import Spinner from "../../components/spinner";
import { IdentityContext } from "../../hooks/useIdentity";
import { Cart } from "../../model/Cart";
import moment from "moment";
import styles from "./index.module.scss";
import useToastState from "../../hooks/useToastState";
import Toast from "../../components/toast";
import List from "../../components/cart/list";
import useLambda, { IFaunaObject } from "../../hooks/useLambda";
import {
  CheckBox,
  CheckBoxOutlineBlank,
  CheckCircle,
} from "@material-ui/icons";
import { IOrder } from "../../model/Order";
import Tooltip from "../../components/tooltip";

interface IOriginal {
  src: string;
}

export default function Review() {
  const [user, token] = useContext(IdentityContext);
  const { data: rawOrderData, execute: loadOrders, isLoading } = useLambda<
    IFaunaObject<IOrder>[]
  >();
  const {
    data: rawOriginalsData,
    execute: loadOriginals,
    isLoading: isLoadingOriginals,
  } = useLambda<IFaunaObject<IOriginal>[]>();
  const { execute: updateOrder, isLoading: isUpdatingOrder } = useLambda<
    IFaunaObject<IOrder>,
    IFaunaObject<Partial<IOrder>>
  >();
  const [orders, setOrders] = useState<IFaunaObject<IOrder>[]>([]);
  const [isToastOpen, openToast, closeToast] = useToastState();

  useEffect(() => {
    /** Launch login popup if there is no user cookie */
    netlifyIdentity.on("init", (user) => {
      if (!user) {
        login();
      }
    });
  }, []);

  useEffect(() => {
    /**
     * Load orders on user login, clear on logout
     */
    if (user && token) {
      loadOrders("order", "GET", null, token, null, openToast);
    } else {
      setOrders(null);
    }
  }, [user, token]);

  useEffect(() => {
    /** Process raw data to create Cart classes */
    if (rawOrderData) {
      const orderData = rawOrderData.slice();
      orderData.forEach((order) => {
        order.data.cart = Cart.constructCartFromDatabase(
          order.data.cart.id,
          order.data.cart
        );
      });
      setOrders(orderData);
    }
  }, [rawOrderData]);

  function login() {
    netlifyIdentity.open("login");
  }

  function logout() {
    netlifyIdentity.logout();
    login();
  }

  function downloadOriginals(order: IFaunaObject<IOrder>) {
    const originals = [];
    order.data.cart.items.forEach((item) => {
      item.originals?.forEach((original) => {
        originals.push(original);
      });
    });

    loadOriginals(`original/${originals.join(",")}`, "GET");
  }

  useEffect(() => {
    if (rawOriginalsData) {
      rawOriginalsData.forEach((original) => {
        const link = document.createElement("a");
        link.setAttribute("href", original.data.src);
        link.setAttribute("download", original.ref["@ref"].id);
        link.click();
      });
    }
  }, [rawOriginalsData]);

  const markReviewed = (order: IFaunaObject<IOrder>) => {
    updateOrder("order", "PATCH", {
      data: {
        isReviewed: true,
      },
      ref: order.ref,
      ts: order.ts,
    }).then(() => {
      const originals = orders.slice();
      originals
        .filter(
          (localOrder) =>
            localOrder.data.payment.paymentID === order.data.payment.paymentID
        )
        .map((localOrder) => {
          localOrder.data.isReviewed = true;
        });
      setOrders(originals);
    });
  };

  return (
    <Page>
      {user ? (
        <React.Fragment>
          <Button onClick={logout} color="primary" variant="contained">
            Logout
          </Button>
          <ul className={styles.orders}>
            {orders ? (
              orders.length === 0 ? (
                <Typography variant="h5" component="h2">
                  There are no orders to review.
                </Typography>
              ) : (
                orders.map((order) => (
                  <li className={styles.order} key={order.ref["@ref"].id}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <>
                            {`Payment ID: ${order.data.payment.paymentID}`}{" "}
                            {order.data.isReviewed ? (
                              <Tooltip
                                title="This order has been reviewed"
                                placement="top"
                              >
                                <CheckCircle color="primary" />
                              </Tooltip>
                            ) : null}
                          </>
                        }
                        subheader={moment(order.ts / 1000)
                          .locale("de")
                          .format("LLL")}
                      />
                      <CardContent>
                        <section className={styles.address}>
                          <Typography
                            variant="h6"
                            component="h2"
                            color="textSecondary"
                          >
                            Name & Address
                          </Typography>
                          <Typography variant="body1" component="p">
                            {order.data.payment.address.recipient_name}
                          </Typography>
                          <Typography variant="body2" component="p">
                            {order.data.payment.address.line1} <br />
                            {order.data.payment.address.city},{" "}
                            {order.data.payment.address.state}{" "}
                            {order.data.payment.address.postal_code}
                          </Typography>
                        </section>
                        <section>
                          <Typography
                            variant="h6"
                            component="h2"
                            color="textSecondary"
                          >
                            Designs
                          </Typography>
                          <List cart={order.data.cart as Cart} />
                        </section>
                      </CardContent>

                      <CardActions disableSpacing>
                        <Button
                          aria-label="download"
                          color="primary"
                          startIcon={<SaveAltIcon />}
                          onClick={() => downloadOriginals(order)}
                          disabled={
                            order.data.cart.items.reduce(
                              (total, item) => total + item.originals?.length,
                              0
                            ) === 0
                          }
                        >
                          Download Images
                        </Button>
                        <Button
                          aria-label="mark reviewed"
                          color="primary"
                          startIcon={
                            order.data.isReviewed ? (
                              <CheckBox />
                            ) : (
                              <CheckBoxOutlineBlank />
                            )
                          }
                          onClick={() => markReviewed(order)}
                          disabled={order.data.isReviewed}
                        >
                          Mark as Reviewed
                        </Button>
                      </CardActions>
                    </Card>
                  </li>
                ))
              )
            ) : null}
          </ul>
        </React.Fragment>
      ) : (
        <Button onClick={login} color="primary" variant="contained">
          Login
        </Button>
      )}
      <Spinner
        isSpinning={isLoading || isLoadingOriginals || isUpdatingOrder}
      />
      <Toast isToastOpen={isToastOpen} onClose={closeToast} severity="error">
        Something went wrong. Please try again.
      </Toast>
    </Page>
  );
}
