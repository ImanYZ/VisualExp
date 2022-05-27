import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import { GetServerSideProps, NextPage } from "next/types";
import { ParsedUrlQuery } from "querystring";

import LinkedNodes from "../../components/LinkedNodes";
import NodeHead from "../../components/NodeHead";
import NodeItem from "../../components/NodeItem";
import NodeItemContributors from "../../components/NodeItemContributors";
import PagesNavbar from "../../components/PagesNavbar";
import ReferencesList from "../../components/ReferencesList";
import TagsList from "../../components/TagsList";
import { getNodeData, logViews } from "../../lib/nodes";
import { escapeBreaksQuotes } from "../../lib/utils";
import { KnowledgeNode } from "../../src/knowledgeTypes";

type Props = {
  node: KnowledgeNode;
  keywords: string;
  updatedStr: string;
  createdStr: string;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<Props, Params> = async ({ req, params }) => {
  logViews(req, params?.id || "");
  const nodeData = await getNodeData(params?.id || "");
  if (!nodeData) {
    return {
      // returns the default 404 page with a status code of 404
      notFound: true
    };
  }
  let keywords = "";
  for (let tag of nodeData.tags || []) {
    keywords += escapeBreaksQuotes(tag.title) + ", ";
  }

  const updatedStr = nodeData.changedAt ? dayjs(new Date(nodeData.changedAt)).format("YYYY-MM-DD") : "";
  const createdStr = nodeData.createdAt ? dayjs(new Date(nodeData.createdAt)).format("YYYY-MM-DD") : "";

  return {
    props: {
      node: nodeData,
      keywords,
      updatedStr,
      createdStr
    }
  };
};

const NodePage: NextPage<Props> = ({ node, keywords, createdStr, updatedStr }) => {
  return (
    <PagesNavbar title={`1Cademy - ${node.title}`}>
      <NodeHead node={node} keywords={keywords} createdStr={createdStr} updatedStr={updatedStr} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNodes data={node.parents || []} header="Learn Before" />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <NodeItem
            node={node}
            contributors={
              <NodeItemContributors contributors={node.contributors || []} institutions={node.institutions || []} />
            }
          />
          <ReferencesList references={node.references || []} sx={{ mt: 3 }} />
          <TagsList tags={node.tags || []} sx={{ mt: 3 }} />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
          <LinkedNodes data={node.children || []} header="Learn After" />
        </Grid>
      </Grid>
    </PagesNavbar>
  );
};

export default NodePage;
