<template>
    <div class="data-table">
        <div class="card card-body table-card">
            <vuetable
                    :dataManager="dataManager"
                    :sortOrder="sortOrder"
                    :css="css"
                    :api-mode="false"
                    @vuetable:pagination-data="onPaginationData"
                    :fields="fields"
                    :data="data"
                    data-path="data"
                    pagination-path="meta"
            >
                <template slot="actions" slot-scope="props">
                    <div class="actions">
                        <div class="popout">
                            <b-btn
                                    variant="link"
                                    @click="onDelete( props.rowData, props.rowIndex)"
                                    v-b-tooltip.hover
                                    :title="__('Remove from Group')"
                            >
                                <i class="fas fa-minus-circle fa-lg fa-fw"></i>
                            </b-btn>
                        </div>
                    </div>
                </template>
            </vuetable>
            <pagination
                    :single="__('User')"
                    :plural="__('Users')"
                    :perPageSelectEnabled="true"
                    @changePerPage="changePerPage"
                    @vuetable-pagination:change-page="onPageChange"
                    ref="pagination"
            ></pagination>
        </div>
    </div>
</template>

<script>
  import datatableMixin from "../../../components/common/mixins/datatable";
  import __ from "../../../modules/lang";

  export default {
    mixins: [datatableMixin],
    props: ["filter", "groupId"],
    data() {
      return {
        orderBy: "username",
        // Our listing of users
        sortOrder: [
          {
            field: "username",
            sortField: "username",
            direction: "asc"
          }
        ],
        fields: [
          {
            title: __("Username"),
            name: "username",
            sortField: "username"
          },
          {
            title: __("Full Name"),
            name: "fullname",
            sortField: "firstname"
          },
          {
            title: __("Status"),
            name: "status",
            sortField: "status",
            callback: this.formatStatus
          },
          {
            name: "__slot:actions",
            title: ""
          }
        ]
      };
    },
    methods: {
      __(variable) {
        return __(variable);
      },
      formatStatus(status) {
        status = status.toLowerCase();
        let bubbleColor = {
          active: "text-success",
          inactive: "text-danger",
          draft: "text-warning",
          archived: "text-info"
        };
        return (
          '<i class="fas fa-circle ' +
          bubbleColor[status] +
          ' small"></i> ' +
          status.charAt(0).toUpperCase() +
          status.slice(1)
        );
      },
      onEdit(data, index) {
        window.location = "/admin/groups/" + data.id + "/edit";
      },
      onDelete(data, index) {
        let that = this;
        console.log(data);
        ProcessMaker.confirmModal(
          __("Caution!"),
          __("Are you sure to delete the group ") + data.fullname + __("?"),
          "",
          function () {
            ProcessMaker.apiClient
              .delete("group_members/" + data.id)
              .then(response => {
                ProcessMaker.alert(__("The user was removed from the group."), "success");
                that.fetch();
              });
          }
        );
      },
      onAction(action, data, index) {
        switch (action) {
          case "users-item":
            //todo
            break;
          case "permissions-item":
            //todo
            break;
        }
      },
      fetch() {
        this.loading = true;
        this.orderBy = this.orderBy === "fullname" ? "firstname" : this.orderBy;
        // Load from our api client
        ProcessMaker.apiClient
          .get(
            "group_users/" +
            this.groupId +
            "?page=" +
            this.page +
            "&per_page=" +
            this.perPage +
            "&filter=" +
            this.filter +
            "&group_id=" +
            this.groupId +
            "&order_by=" +
            this.orderBy +
            "&order_direction=" +
            this.orderDirection
          )
          .then(response => {
            this.data = this.transform(response.data);
            this.loading = false;
          });
      }
    }
  };
</script>

<style lang="scss" scoped>
    /deep/ th#_total_users {
        width: 150px;
        text-align: center;
    }

    /deep/ .vuetable-th-status {
        min-width: 90px;
    }

    /deep/ .vuetable-th-members_count {
        min-width: 90px;
    }
</style>
