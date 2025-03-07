import {
  setLayoutConversionStateAction,
  updateSnapshotDetails,
} from "actions/autoLayoutActions";
import type { ApiResponse } from "api/ApiResponses";
import ApplicationApi from "@appsmith/api/ApplicationApi";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import log from "loglevel";
import type { SnapShotDetails } from "reducers/uiReducers/layoutConversionReducer";
import { CONVERSION_STATES } from "reducers/uiReducers/layoutConversionReducer";
import { all, call, put, select, takeLatest } from "redux-saga/effects";
import {
  getAppPositioningType,
  getCurrentApplicationId,
} from "selectors/editorSelectors";
import { getLogToSentryFromResponse } from "utils/helpers";
import { validateResponse } from "./ErrorSagas";
import { updateApplicationLayoutType } from "./AutoLayoutUpdateSagas";
import { AppPositioningTypes } from "reducers/entityReducers/pageListReducer";
import AnalyticsUtil from "utils/AnalyticsUtil";

//Saga to create application snapshot
export function* createSnapshotSaga() {
  let response: ApiResponse | undefined;
  try {
    const applicationId: string = yield select(getCurrentApplicationId);
    response = yield ApplicationApi.createApplicationSnapShot({
      applicationId,
    });

    const isValidResponse: boolean = yield validateResponse(
      response,
      false,
      getLogToSentryFromResponse(response),
    );

    if (isValidResponse) {
      return true;
    }
  } catch (error) {
    throw error;
  }
}

//Saga to fetch application snapshot
export function* fetchSnapshotSaga() {
  let response: ApiResponse<SnapShotDetails> | undefined;
  try {
    const applicationId: string = yield select(getCurrentApplicationId);
    response = yield ApplicationApi.getSnapShotDetails({
      applicationId,
    });

    const isValidResponse: boolean = yield validateResponse(
      response,
      false,
      getLogToSentryFromResponse(response),
    );

    if (isValidResponse) {
      const snapShotDetails = response?.data;

      return snapShotDetails;
    }
  } catch (error) {
    if (getLogToSentryFromResponse(response)) {
      log.error(error);
      throw error;
    }
  }
}

//Saga to restore application snapshot
function* restoreApplicationFromSnapshotSaga() {
  let response: ApiResponse<any> | undefined;
  let appId = "";
  try {
    appId = yield select(getCurrentApplicationId);
    AnalyticsUtil.logEvent("RESTORE_SNAPSHOT", {
      appId,
    });

    const applicationId: string = yield select(getCurrentApplicationId);
    response = yield ApplicationApi.restoreApplicationFromSnapshot({
      applicationId,
    });

    const currentAppPositioningType: AppPositioningTypes = yield select(
      getAppPositioningType,
    );

    const isValidResponse: boolean = yield validateResponse(
      response,
      false,
      getLogToSentryFromResponse(response),
    );

    //update layout positioning type from
    yield call(
      updateApplicationLayoutType,
      currentAppPositioningType === AppPositioningTypes.FIXED
        ? AppPositioningTypes.AUTO
        : AppPositioningTypes.FIXED,
    );

    if (response?.data?.applicationDetail?.appPositioning?.type) {
      //update layout positioning type from response
      yield call(
        updateApplicationLayoutType,
        response.data.applicationDetail.appPositioning.type,
      );
    }

    if (isValidResponse) {
      //update conversion form state to success
      yield put(
        setLayoutConversionStateAction(CONVERSION_STATES.COMPLETED_SUCCESS),
      );
    }
  } catch (e: any) {
    let error: Error = e;
    if (error) {
      error.message = `Layout Conversion Error - while Restoring Snapshot: ${error.message}`;
    } else {
      error = new Error("Layout Conversion Error - while Restoring Snapshot");
    }

    log.error(error);
    //update conversion form state to error
    yield put(
      setLayoutConversionStateAction(CONVERSION_STATES.COMPLETED_ERROR, error),
    );

    AnalyticsUtil.logEvent("CONVERSION_FAILURE", {
      flow: "RESTORE_SNAPSHOT",
      appId,
    });
  }
}

//Saga to delete application snapshot
export function* deleteApplicationSnapshotSaga() {
  let response: ApiResponse | undefined;
  try {
    const applicationId: string = yield select(getCurrentApplicationId);
    response = yield ApplicationApi.deleteApplicationSnapShot({
      applicationId,
    });

    const isValidResponse: boolean = yield validateResponse(
      response,
      false,
      getLogToSentryFromResponse(response),
    );

    if (isValidResponse) {
      yield put(updateSnapshotDetails(undefined));
    }
  } catch (error) {
    log.error(error);
    throw error;
  }
}

//Saga to update snapshot details by fetching info from backend
function* updateSnapshotDetailsSaga() {
  try {
    const snapShotDetails: { updatedTime: Date } | undefined = yield call(
      fetchSnapshotSaga,
    );
    yield put(
      updateSnapshotDetails(
        snapShotDetails
          ? { lastUpdatedTime: snapShotDetails.updatedTime?.toString() }
          : undefined,
      ),
    );
  } catch (error) {
    throw error;
  }
}

export default function* snapshotSagas() {
  yield all([
    takeLatest(
      ReduxActionTypes.RESTORE_SNAPSHOT,
      restoreApplicationFromSnapshotSaga,
    ),
    takeLatest(
      [
        ReduxActionTypes.INIT_CANVAS_LAYOUT,
        ReduxActionTypes.FETCH_SNAPSHOT,
        ReduxActionTypes.START_CONVERSION_FLOW,
      ],
      updateSnapshotDetailsSaga,
    ),
    takeLatest(ReduxActionTypes.DELETE_SNAPSHOT, deleteApplicationSnapshotSaga),
  ]);
}
