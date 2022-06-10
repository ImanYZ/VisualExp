import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { GetStaticPaths, GetStaticProps, NextPage } from "next/types";
import { ParsedUrlQuery } from "querystring";
import React, { ComponentType } from "react";

import NodeItemContributors from "../../components/NodeItemContributors";
import PagesNavbar from "../../components/PagesNavbar";
import { getNodeData } from "../../lib/nodes";
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

const NodeItemFullContainer: ComponentType<any> = dynamic(
  () => import("../../components/NodeItemFull").then(m => m.NodeItemFull),
  {
    ssr: false
  }
);

const NodeHeadContainer: ComponentType<any> = dynamic(() => import("../../components/NodeHead").then(m => m.NodeHead), {
  ssr: false
});

const LinkedNodesContainer = dynamic(() => import("../../components/LinkedNodes"), { ssr: false });

const ReferencesListContainer: ComponentType<any> = dynamic(
  () => import("../../components/ReferencesList").then(m => m.ReferencesList),
  { ssr: false }
);

const TagsListContainer: ComponentType<any> = dynamic(() => import("../../components/TagsList").then(m => m.TagsList), {
  ssr: false
});
export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  console.log("********** update-incremental-static-node - getStaticProps - params", params);
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
    },
    revalidate: 20
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const paths = [
    { params: { id: "zzyy7iThmjX3M9OzngE8" } },
    { params: { id: "zzkoyR3Ke1kRaH5Pf9ZH" } },
    { params: { id: "zzWNrYf8GjnXBqkf9mJQ" } },
    { params: { id: "zzeuylk97oZMOZ4p6tzQ" } },
    { params: { id: "zzS0u9ZJD1hbIG3b7TiH" } },
    { params: { id: "zzQ5WUf0S9dfizdpD7Jl" } },
    { params: { id: "zz8ni7EhCnklLOYGUZ0n" } },
    { params: { id: "zzFaAfrBpm4n3xqlFYqZ" } },
    { params: { id: "zzBGPoYppADsx5p3tYPs" } },
    { params: { id: "zzFjyn44HwTexs4pHOE0" } }
  ];
  console.log("------ update-incremental-static-node - getStaticPaths - paths ", paths);
  return { paths, fallback: true };
};

const NodePage: NextPage<Props> = ({ node, keywords, createdStr, updatedStr }) => {
  //   console.log("NodePage- update-incremental-static-node- node", node);

  const { parents, contributors, references, institutions, tags, children, siblings } = node || {};
  return (
    <PagesNavbar title={`1Cademy - ${node?.title}`}>
      <Box sx={{ p: { xs: 3, md: 10 } }}>
        <NodeHeadContainer node={node} keywords={keywords} createdStr={createdStr} updatedStr={updatedStr} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={3}>
            {parents && parents?.length > 0 && <LinkedNodesContainer data={parents || []} header="Learn Before" />}
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <NodeItemFullContainer
              node={node}
              contributors={
                <NodeItemContributors contributors={contributors || []} institutions={institutions || []} />
              }
              references={<ReferencesListContainer references={references || []} sx={{ mt: 3 }} />}
              tags={<TagsListContainer tags={tags || []} sx={{ mt: 3 }} />}
            />
            {siblings && siblings.length > 0 && (
              <LinkedNodesContainer sx={{ mt: 3 }} data={siblings} header="Related"></LinkedNodesContainer>
            )}
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            {children && children?.length > 0 && <LinkedNodesContainer data={children || []} header="Learn After" />}
          </Grid>
        </Grid>
      </Box>
    </PagesNavbar>
  );
};

export default NodePage;
